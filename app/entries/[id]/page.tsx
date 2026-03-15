import { getSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import EntryDocument from "./EntryDocument";

export const dynamic = "force-dynamic";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();
  if (!supabase) notFound();

  const { data: entry, error } = await supabase
    .from("entries")
    .select("id, title, body, entry_date, created_at, tags")
    .eq("id", id)
    .single();

  if (error || !entry) notFound();

  let existingTags: string[] = [];
  const { data: allEntries } = await supabase
    .from("entries")
    .select("tags")
    .not("tags", "is", null);
  const allTags = (allEntries ?? []).flatMap((r) => (r.tags as string[]) ?? []);
  existingTags = Array.from(new Set(allTags)).filter(Boolean).sort();

  const entryData = {
    id: entry.id,
    title: entry.title ?? "",
    body: entry.body ?? "",
    entry_date: entry.entry_date,
    created_at: entry.created_at,
    tags: (entry.tags as string[] | null) ?? [],
  };

  return (
    <EntryDocument entry={entryData} existingTags={existingTags} />
  );
}
