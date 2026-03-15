"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor, { getDefaultEditorContent } from "@/app/components/RichTextEditor";
import TagInput from "@/app/components/TagInput";
import DeleteModal from "@/app/components/DeleteModal";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type ScrapbookData = {
  id: string;
  processed_url: string;
  title: string;
  entry_date: string;
  created_at: string;
  tags: string[];
  transcription: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

async function performSave(
  id: string,
  payload: { title: string; transcription: string; entry_date: string; tags: string[] }
): Promise<{ error: Error | null }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { error: new Error("No client") };
  const { data, error } = await supabase
    .from("scrapbook_uploads")
    .update({
      title: payload.title.trim(),
      transcription: payload.transcription || "",
      entry_date: payload.entry_date,
      tags: payload.tags.length ? payload.tags : [],
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { error: new Error(error.message) };
  if (!data?.id) return { error: new Error("No rows updated (check RLS UPDATE policy)") };
  return { error: null };
}

function useDebouncedSave(
  id: string,
  payload: { title: string; transcription: string; entry_date: string; tags: string[] },
  delayMs: number,
  getLatestTranscription?: () => string
): { status: SaveStatus; flush: () => Promise<void> } {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const isFirstMount = useRef(true);
  const payloadRef = useRef(payload);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getLatestRef = useRef(getLatestTranscription);
  getLatestRef.current = getLatestTranscription;
  payloadRef.current = payload;

  const buildPayload = () => {
    const p = payloadRef.current;
    const transcription = getLatestRef.current?.() ?? p.transcription;
    return { ...p, transcription: transcription || "" };
  };

  const flush = useCallback(async () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    const toSave = buildPayload();
    const key = JSON.stringify(toSave);
    if (key === lastSavedRef.current) return;
    setStatus("saving");
    const { error } = await performSave(id, toSave);
    if (!error) {
      lastSavedRef.current = key;
      setStatus("saved");
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => { setStatus("idle"); savedTimeoutRef.current = null; }, 1200);
    } else {
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    if (isFirstMount.current) {
      lastSavedRef.current = JSON.stringify(payload);
      isFirstMount.current = false;
      return;
    }
    const key = JSON.stringify(payload);
    if (key === lastSavedRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { void flush(); }, delayMs);
    return () => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, [payload.title, payload.transcription, payload.entry_date, JSON.stringify(payload.tags), delayMs, flush]);

  return { status, flush };
}

function formatCreated(createdAt: string) {
  try {
    const d = new Date(createdAt);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  } catch { return createdAt; }
}

const propertyRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "10px 0",
  borderBottom: "1px solid #e6e4dc",
  fontFamily: "var(--font-sans), Inter, sans-serif",
  fontSize: 14,
  color: "#3d3d3a",
};

const propertyLabel: React.CSSProperties = {
  flex: "0 0 100px",
  color: "#8a7d6e",
  paddingTop: 2,
};

export default function ScrapbookDocument({
  item,
  existingTags,
}: {
  item: ScrapbookData;
  existingTags: string[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title || "");
  const [entryDate, setEntryDate] = useState(item.entry_date || "");
  const [tags, setTags] = useState<string[]>(item.tags || []);
  const [transcription, setTranscription] = useState(item.transcription || getDefaultEditorContent());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const transcriptionRef = useRef<string | null>(null);

  const getLatestTranscription = useCallback(() => transcriptionRef.current ?? transcription, [transcription]);

  const { status: saveStatus, flush: flushSave } = useDebouncedSave(
    item.id,
    { title, transcription, entry_date: entryDate, tags },
    600,
    getLatestTranscription
  );

  async function handleDelete() {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.from("scrapbook_uploads").delete().eq("id", item.id);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px var(--px) 80px",
        minHeight: "100dvh",
        background: "var(--bg)",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/"
          onClick={async (e) => {
            e.preventDefault();
            await flushSave();
            router.back();
          }}
          style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 14,
            color: "#8a7d6e",
            textDecoration: "none",
          }}
        >
          ← Back to journal
        </Link>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e6e4dc",
          borderRadius: 12,
          padding: "32px 40px 40px",
          minHeight: 400,
          position: "relative",
        }}
      >
        {/* Processed image */}
        <div style={{ marginBottom: 28, background: "#f5f0e8", borderRadius: 8, overflow: "hidden" }}>
          <img
            src={item.processed_url}
            alt="Journal spread"
            style={{ width: "100%", maxHeight: 380, objectFit: "contain", display: "block" }}
          />
        </div>

        {/* Editable title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-serif), 'Averia Serif Libre', Georgia, serif",
            fontSize: 32,
            fontWeight: 600,
            color: "#1a1a1a",
            marginBottom: 8,
            padding: 0,
            background: "transparent",
          }}
        />

        {/* Properties */}
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <div style={propertyRow}>
            <span style={propertyLabel}>Created</span>
            <span style={{ color: "#6b6b6b" }}>{formatCreated(item.created_at)}</span>
          </div>
          <div style={propertyRow}>
            <span style={propertyLabel}>Tags</span>
            <div style={{ flex: 1 }}>
              <TagInput
                value={tags}
                onChange={setTags}
                existingTags={existingTags}
                placeholder="Add a tag…"
              />
            </div>
          </div>
          <div style={propertyRow}>
            <span style={propertyLabel}>Date</span>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontFamily: "inherit",
                fontSize: 14,
                color: "#3d3d3a",
                background: "transparent",
                padding: "4px 0",
              }}
            />
          </div>
        </div>

        {/* Transcription / notes */}
        <div style={{ marginTop: 16 }}>
          <RichTextEditor
            value={transcription}
            onChange={setTranscription}
            placeholder="Add transcription or notes about this spread…"
            variant="document"
            contentRef={transcriptionRef}
          />
        </div>

        {/* Save status */}
        {saveStatus !== "idle" && (
          <div
            style={{
              position: "absolute",
              bottom: 24,
              right: 40,
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontSize: 13,
              color: saveStatus === "error" ? "#b45353" : "#9a9590",
            }}
          >
            {saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Save failed" : "Saved"}
          </div>
        )}

        {/* Delete */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e6e4dc" }}>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn-hover"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #c53030",
              color: "#c53030",
              background: "none",
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Delete spread
          </button>
          {showDeleteModal && (
            <DeleteModal
              label="spread"
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteModal(false)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
