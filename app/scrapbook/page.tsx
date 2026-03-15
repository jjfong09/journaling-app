import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import ScrapbookUploader from "./ScrapbookUploader";
import ScrapbookCard from "./ScrapbookCard";

export const dynamic = "force-dynamic";

export default async function ScrapbookPage() {
  const supabase = getSupabase();
  const uploads = supabase
    ? (
        await supabase
          .from("scrapbook_uploads")
          .select("id, processed_url, entry_date")
          .order("entry_date", { ascending: false })
          .order("created_at", { ascending: false })
      ).data ?? []
    : [];

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <header style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>Scrapbook</h1>
        <nav
          style={{
            marginTop: "0.75rem",
            display: "flex",
            gap: "1rem",
            color: "var(--muted)",
            fontSize: "0.9rem",
          }}
        >
          <Link href="/">Timeline</Link>
          <Link href="/scrapbook">Scrapbook</Link>
          <Link href="/entries/new">New entry</Link>
        </nav>
      </header>

      <section style={{ marginBottom: "1.25rem" }}>
        <ScrapbookUploader />
      </section>

      <section aria-label="Scrapbook Gallery">
        <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>
          Gallery
        </h2>
        {uploads.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            No scrapbook uploads yet. Upload your first spread above.
          </p>
        ) : (
          <div style={{ columnCount: 2, columnGap: "0.8rem" }}>
            {uploads.map((item) => (
              <ScrapbookCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
