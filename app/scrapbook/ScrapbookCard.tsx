"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type Upload = {
  id: string;
  processed_url: string;
  entry_date: string;
};

export default function ScrapbookCard({ item }: { item: Upload }) {
  const router = useRouter();
  const [editingDate, setEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(item.entry_date);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function saveDate() {
    if (dateValue === item.entry_date) {
      setEditingDate(false);
      return;
    }
    setSaving(true);
    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase
        .from("scrapbook_uploads")
        .update({ entry_date: dateValue })
        .eq("id", item.id);
      router.refresh();
    }
    setSaving(false);
    setEditingDate(false);
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.from("scrapbook_uploads").delete().eq("id", item.id);
      router.refresh();
    }
    setDeleting(false);
  }

  return (
    <article
      className="card-hover"
      style={{
        breakInside: "avoid",
        marginBottom: "0.8rem",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <img
        src={item.processed_url}
        alt="Scrapbook spread"
        style={{ width: "100%", display: "block", height: "auto" }}
      />
      <div
        style={{
          padding: "0.5rem 0.6rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
        }}
      >
        {editingDate ? (
          <>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              style={{
                fontSize: "0.8rem",
                padding: "4px 6px",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontFamily: "var(--font-sans)",
              }}
            />
            <button
              type="button"
              onClick={saveDate}
              disabled={saving}
              className="btn-primary-hover"
              style={{
                fontSize: "0.75rem",
                padding: "4px 10px",
                border: "none",
                borderRadius: 4,
                background: "#342f2f",
                color: "#fff",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDateValue(item.entry_date);
                setEditingDate(false);
              }}
              className="btn-hover"
              style={{
                fontSize: "0.75rem",
                padding: "4px 10px",
                border: "1px solid var(--border)",
                borderRadius: 4,
                background: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>
              {item.entry_date}
            </p>
            <button
              type="button"
              onClick={() => setEditingDate(true)}
              className="btn-hover"
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                border: "1px solid var(--border)",
                borderRadius: 4,
                background: "none",
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              Edit date
            </button>
          </>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="btn-hover"
          style={{
            fontSize: "0.75rem",
            padding: "2px 8px",
            border: "1px solid #c53030",
            borderRadius: 4,
            background: "none",
            color: "#c53030",
            cursor: deleting ? "not-allowed" : "pointer",
            marginLeft: "auto",
          }}
        >
          {deleting ? "Deleting…" : confirmDelete ? "Click again to delete" : "Delete"}
        </button>
        {confirmDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="btn-hover"
            style={{
              fontSize: "0.75rem",
              padding: "2px 8px",
              border: "1px solid var(--border)",
              borderRadius: 4,
              background: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </article>
  );
}
