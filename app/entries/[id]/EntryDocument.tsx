"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor, { getDefaultEditorContent } from "@/app/components/RichTextEditor";
import TagInput from "@/app/components/TagInput";
import DeleteModal from "@/app/components/DeleteModal";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type EntryData = {
  id: string;
  title: string;
  body: string;
  entry_date: string;
  created_at: string;
  tags: string[];
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

async function performSave(
  entryId: string,
  payload: { title: string; body: string; entry_date: string; tags: string[] }
): Promise<{ error: Error | null }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { error: new Error("No client") };
  const { data, error } = await supabase
    .from("entries")
    .update({
      title: payload.title.trim(),
      body: payload.body || getDefaultEditorContent(),
      entry_date: payload.entry_date,
      tags: payload.tags.length ? payload.tags : [],
    })
    .eq("id", entryId)
    .select("id")
    .maybeSingle();
  if (error) return { error: new Error(error.message) };
  if (!data?.id) {
    return { error: new Error("No rows updated (check RLS UPDATE policy and row visibility)") };
  }
  return { error: null };
}

function useDebouncedSave(
  entryId: string,
  payload: { title: string; body: string; entry_date: string; tags: string[] },
  delayMs: number,
  getLatestBody?: () => string
): { status: SaveStatus; flush: () => Promise<void> } {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const isFirstMount = useRef(true);
  const payloadRef = useRef(payload);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getLatestBodyRef = useRef(getLatestBody);
  getLatestBodyRef.current = getLatestBody;
  payloadRef.current = payload;

  const buildPayload = () => {
    const p = payloadRef.current;
    const body = getLatestBodyRef.current?.() ?? p.body;
    return { ...p, body: body || getDefaultEditorContent() };
  };

  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const toSave = buildPayload();
    const key = JSON.stringify(toSave);
    if (key === lastSavedRef.current) return;
    setStatus("saving");
    const { error } = await performSave(entryId, toSave);
    if (!error) {
      lastSavedRef.current = key;
      setStatus("saved");
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => {
        setStatus("idle");
        savedTimeoutRef.current = null;
      }, 1200);
    } else {
      setStatus("error");
    }
  }, [entryId]);

  useEffect(() => {
    if (isFirstMount.current) {
      lastSavedRef.current = JSON.stringify(payload);
      isFirstMount.current = false;
      return;
    }
    const key = JSON.stringify(payload);
    if (key === lastSavedRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      void flush();
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, [payload.title, payload.body, payload.entry_date, JSON.stringify(payload.tags), delayMs, flush]);

  return { status, flush };
}

function formatCreated(createdAt: string) {
  try {
    const d = new Date(createdAt);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return createdAt;
  }
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

export default function EntryDocument({
  entry,
  existingTags,
}: {
  entry: EntryData;
  existingTags: string[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(entry.title || "");
  const [entryDate, setEntryDate] = useState(entry.entry_date || "");
  const [tags, setTags] = useState<string[]>(entry.tags || []);
  const [body, setBody] = useState(entry.body || getDefaultEditorContent());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const bodyContentRef = useRef<string | null>(null);

  const getLatestBody = useCallback(() => bodyContentRef.current ?? body, [body]);

  const { status: saveStatus, flush: flushSave } = useDebouncedSave(
    entry.id,
    { title, body, entry_date: entryDate, tags },
    600,
    getLatestBody
  );

  async function handleDelete() {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.from("entries").delete().eq("id", entry.id);
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
            <span style={{ color: "#6b6b6b" }}>{formatCreated(entry.created_at)}</span>
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

        {/* Body: always-on rich text */}
        <div style={{ marginTop: 16 }}>
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder="Write your entry…"
            variant="document"
            contentRef={bodyContentRef}
          />
        </div>

        {/* Save status — bottom right of container */}
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
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "error"
                ? "Save failed"
                : "Saved"}
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
            Delete entry
          </button>
        </div>

        {showDeleteModal && (
          <DeleteModal
            label="entry"
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </div>
    </main>
  );
}
