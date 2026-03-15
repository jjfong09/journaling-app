"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const linkStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 22,
  border: "1.5px solid #342f2f",
  color: "#342f2f",
  fontFamily: "var(--font-sans), Inter, sans-serif",
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
};

export default function EntryActions({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.from("entries").delete().eq("id", entryId);
    setDeleting(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
      <Link href={`/entries/${entryId}/edit`} style={linkStyle}>
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        style={{
          ...linkStyle,
          border: "1.5px solid #c53030",
          color: "#c53030",
          background: "none",
          cursor: deleting ? "not-allowed" : "pointer",
          opacity: deleting ? 0.7 : 1,
        }}
      >
        {deleting
          ? "Deleting…"
          : confirming
            ? "Click again to delete"
            : "Delete"}
      </button>
      {confirming && (
        <button
          type="button"
          onClick={() => setConfirming(false)}
          style={{
            ...linkStyle,
            border: "1.5px solid #8a7d6e",
            color: "#8a7d6e",
            background: "none",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
