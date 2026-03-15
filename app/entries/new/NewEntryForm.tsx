"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichTextEditor, { getDefaultEditorContent } from "@/app/components/RichTextEditor";
import TagInput from "@/app/components/TagInput";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { ensureImageFileForUpload } from "@/lib/heic";

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

export default function NewEntryForm({ existingTags }: { existingTags: string[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState<string[]>([]);
  const [body, setBody] = useState(getDefaultEditorContent());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyContentRef = useRef<string | null>(null);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageSelect(file: File) {
    if (!file.type.startsWith("image/")) return;
    ensureImageFileForUpload(file).then(
      (toUse) => {
        setImageFile(toUse);
        setImagePreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(toUse);
        });
      },
      () => setError("That image format couldn't be used. Try a JPEG or PNG.")
    );
  }

  function removeImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageSelect(file);
  }, []);

  async function handleSave() {
    setError(null);
    setSaving(true);

    const latestBody = bodyContentRef.current ?? body;

    if (imageFile) {
      // Scrapbook entry: send to remove-bg API
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("entryDate", entryDate);
      formData.append("title", title.trim());
      formData.append("tags", JSON.stringify(tags));
      formData.append("transcription", latestBody || "");

      try {
        const res = await fetch("/api/remove-bg", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.details || json?.error || "Upload failed.");
        if (json.item?.id) {
          router.push(`/scrapbook/${json.item.id}`);
        } else {
          router.push("/");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
        setSaving(false);
      }
      return;
    }

    // Text entry
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
      );
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("entries")
      .insert({
        title: title.trim(),
        body: latestBody || getDefaultEditorContent(),
        entry_date: entryDate,
        tags: tags.length ? tags : [],
      })
      .select("id")
      .single();

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    if (data?.id) {
      router.push(`/entries/${data.id}`);
    } else {
      router.push("/");
    }
  }

  return (
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
      {/* Image drop zone */}
      {imagePreview ? (
        <div style={{ marginBottom: 28, position: "relative" }}>
          <img
            src={imagePreview}
            alt="Selected spread"
            style={{
              width: "100%",
              maxHeight: 320,
              objectFit: "contain",
              borderRadius: 8,
              background: "#f5f0e8",
            }}
          />
          <button
            type="button"
            onClick={removeImage}
            className="btn-hover"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            marginBottom: 28,
            border: `2px dashed ${dragOver ? "#8a7d6e" : "#e6e4dc"}`,
            borderRadius: 10,
            padding: "28px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "#faf9f5" : "transparent",
            transition: "all 0.15s",
          }}
        >
          <p style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 14,
            color: "#8a7d6e",
            margin: 0,
          }}>
            Drop an image or{" "}
            <span style={{ textDecoration: "underline" }}>browse</span>
            {" "}to attach a spread
          </p>
          <p style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 12,
            color: "#b8ae9e",
            marginTop: 6,
            marginBottom: 0,
          }}>
            Optional — skip to create a text-only entry
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageSelect(file);
        }}
      />

      {/* Title */}
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

      {/* Body / transcription */}
      <div style={{ marginTop: 16 }}>
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder={imageFile ? "Add transcription or notes about this spread…" : "Write your entry…"}
          variant="document"
          contentRef={bodyContentRef}
        />
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 48,
        paddingTop: 24,
        borderTop: "1px solid #e6e4dc",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary-hover"
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            background: "#342f2f",
            color: "#fff",
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving
            ? (imageFile ? "Removing background…" : "Saving…")
            : (imageFile ? "Save spread" : "Save entry")}
        </button>
        <Link
          href="/"
          className="btn-hover"
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #e6e4dc",
            color: "#8a7d6e",
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Cancel
        </Link>
        {error && (
          <span style={{ color: "#c53030", fontSize: 13, fontFamily: "var(--font-sans)" }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
