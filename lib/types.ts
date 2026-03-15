export type JournalEntry = {
  type: "entry";
  id: string;
  title: string;
  body: string;
  entry_date: string;
  mood?: string;
  color: string;
  textColor: string;
};

export type ScrapbookEntry = {
  type: "scrapbook";
  id: string;
  processed_url: string;
  entry_date: string;
  title: string;
  tags: string[];
  mood?: string;
  color: string;
  textColor: string;
  transcription: string;
};

export type JournalItem = JournalEntry | ScrapbookEntry;

// Exact colors from Figma design
export const CARD_PALETTE: { bg: string; text: string }[] = [
  { bg: "#e4b975", text: "#634313" },
  { bg: "#bbb3cb", text: "#493f61" },
  { bg: "#9dcbc9", text: "#15645e" },
  { bg: "#e8967a", text: "#5c1f00" },
  { bg: "#98c895", text: "#1e4d1c" },
];
