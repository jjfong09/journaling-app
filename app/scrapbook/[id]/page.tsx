import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import ScrapbookDocument from "./ScrapbookDocument";

export const dynamic = "force-dynamic";

export default async function ScrapbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();
  if (!supabase) notFound();

  const { data: item } = await supabase
    .from("scrapbook_uploads")
    .select("id, processed_url, title, entry_date, created_at, tags, transcription")
    .eq("id", id)
    .single();

  if (!item) notFound();

  // Fetch existing tags for suggestions (from both tables)
  const [entriesTagsRes, scrapbookTagsRes] = await Promise.all([
    supabase.from("entries").select("tags").not("tags", "is", null),
    supabase.from("scrapbook_uploads").select("tags").not("tags", "is", null),
  ]);
  const allTags = [
    ...(entriesTagsRes.data ?? []).flatMap((r) => (r.tags as string[]) ?? []),
    ...(scrapbookTagsRes.data ?? []).flatMap((r) => (r.tags as string[]) ?? []),
  ];
  const existingTags = Array.from(new Set(allTags)).filter(Boolean).sort();

  const itemData = {
    id: item.id,
    processed_url: item.processed_url,
    title: item.title ?? "",
    entry_date: item.entry_date,
    created_at: item.created_at,
    tags: (item.tags as string[] | null) ?? [],
    transcription: item.transcription ?? "",
  };

  return <ScrapbookDocument item={itemData} existingTags={existingTags} />;
}
