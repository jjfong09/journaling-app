import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const REMOVE_BG_URL = "https://api.remove.bg/v1.0/removebg";
const SCRAPBOOK_BUCKET = "Journal App";

function getSafeExtension(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "REMOVE_BG_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Request body must be multipart form data" },
      { status: 400 }
    );
  }

  const file = body.get("image") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing or invalid 'image' file in form data" },
      { status: 400 }
    );
  }
  const entryDate = String(body.get("entryDate") || "").trim();
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(entryDate);
  const finalEntryDate = isValidDate
    ? entryDate
    : new Date().toISOString().slice(0, 10);

  const title = String(body.get("title") || "").trim();
  const tagsRaw = String(body.get("tags") || "[]");
  let tags: string[] = [];
  try { tags = JSON.parse(tagsRaw); } catch { tags = []; }
  const transcription = String(body.get("transcription") || "").trim();

  const form = new FormData();
  form.append("image_file", file);
  form.append("size", "auto");
  form.append("format", "png");

  const removeBgRes = await fetch(REMOVE_BG_URL, {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: form,
  });

  if (!removeBgRes.ok) {
    const errText = await removeBgRes.text();
    return NextResponse.json(
      { error: "Remove.bg request failed", details: errText },
      { status: removeBgRes.status }
    );
  }

  const pngBuffer = await removeBgRes.arrayBuffer();
  const randomId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const processedPath = `processed/${randomId}.png`;
  const originalPath = `original/${randomId}.${getSafeExtension(file.type)}`;

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
      { status: 503 }
    );
  }

  const { data: originalUpload } = await supabase.storage
    .from(SCRAPBOOK_BUCKET)
    .upload(originalPath, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(SCRAPBOOK_BUCKET)
    .upload(processedPath, pngBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Supabase storage upload failed", details: uploadError.message },
      { status: 500 }
    );
  }

  const { data: processedUrlData } = supabase.storage
    .from(SCRAPBOOK_BUCKET)
    .getPublicUrl(uploadData.path);
  const originalUrl = originalUpload
    ? supabase.storage.from(SCRAPBOOK_BUCKET).getPublicUrl(originalUpload.path).data
        .publicUrl
    : null;

  const { data: inserted, error: insertError } = await supabase
    .from("scrapbook_uploads")
    .insert({
      original_url: originalUrl,
      processed_url: processedUrlData.publicUrl,
      entry_date: finalEntryDate,
      title,
      tags,
      transcription,
    })
    .select("id, original_url, processed_url, entry_date, title, tags, transcription, created_at")
    .single();

  if (insertError) {
    return NextResponse.json(
      {
        error: "Failed to save scrapbook upload row",
        details: insertError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ item: inserted });
}
