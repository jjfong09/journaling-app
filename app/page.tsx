import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";
import { CARD_PALETTE, JournalEntry, JournalItem, ScrapbookEntry } from "@/lib/types";
import HomeClient from "@/app/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let entries: JournalEntry[] = [];
  let scrapbook: ScrapbookEntry[] = [];

  const supabase = getSupabase();
  if (supabase) {
    const [entriesRes, scrapbookRes] = await Promise.all([
      supabase
        .from("entries")
        .select("id, title, body, entry_date, tags")
        .order("entry_date", { ascending: false }),
      supabase
        .from("scrapbook_uploads")
        .select("id, processed_url, entry_date, title, tags, transcription")
        .order("entry_date", { ascending: false }),
    ]);

    if (entriesRes.data?.length) {
      entries = entriesRes.data.map((e, i) => {
        const tags = (e as { tags?: string[] }).tags ?? [];
        return {
          type: "entry" as const,
          id: e.id,
          title: e.title ?? "",
          body: e.body || "",
          entry_date: e.entry_date,
          mood: tags[0],
          color: CARD_PALETTE[i % CARD_PALETTE.length].bg,
          textColor: CARD_PALETTE[i % CARD_PALETTE.length].text,
        };
      });
    }

    if (scrapbookRes.data?.length) {
      scrapbook = scrapbookRes.data.map((s, i) => {
        const sTags = (s as { tags?: string[] }).tags ?? [];
        return {
          type: "scrapbook" as const,
          id: s.id,
          processed_url: s.processed_url,
          entry_date: s.entry_date,
          title: (s as { title?: string }).title || "Scrapbook",
          tags: sTags,
          mood: sTags[0],
          transcription: (s as { transcription?: string }).transcription || "",
          color: CARD_PALETTE[(entries.length + i) % CARD_PALETTE.length].bg,
          textColor: CARD_PALETTE[(entries.length + i) % CARD_PALETTE.length].text,
        };
      });
    }
  }

  const allItems: JournalItem[] = [...entries, ...scrapbook].sort((a, b) =>
    b.entry_date.localeCompare(a.entry_date)
  );

  return (
    <Suspense>
      <HomeClient items={allItems} />
    </Suspense>
  );
}
