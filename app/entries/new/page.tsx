import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import NewEntryForm from "./NewEntryForm";

export const dynamic = "force-dynamic";

export default async function NewEntryPage() {
  let existingTags: string[] = [];
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("entries")
      .select("tags")
      .not("tags", "is", null);
    const allTags = (data ?? []).flatMap((r) => (r.tags as string[]) ?? []);
    existingTags = Array.from(new Set(allTags)).filter(Boolean).sort();
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

      <NewEntryForm existingTags={existingTags} />
    </main>
  );
}
