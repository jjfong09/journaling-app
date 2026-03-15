import type { Entry, ScrapbookUpload } from "./supabase";

export type TimelineItem =
  | { type: "entry"; data: Entry }
  | { type: "scrapbook"; data: ScrapbookUpload };

function toDateKey(dateStr: string): string {
  return dateStr.split("T")[0];
}

export function mergeTimeline(entries: Entry[], scrapbook: ScrapbookUpload[]): TimelineItem[] {
  const items: TimelineItem[] = [
    ...entries.map((data) => ({ type: "entry" as const, data })),
    ...scrapbook.map((data) => ({ type: "scrapbook" as const, data })),
  ];
  items.sort((a, b) => {
    const dateA = toDateKey(a.data.entry_date);
    const dateB = toDateKey(b.data.entry_date);
    return dateB.localeCompare(dateA);
  });
  return items;
}
