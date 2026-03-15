import { createClient, SupabaseClient } from "@supabase/supabase-js";

/** Always returns a fresh client with no-store fetch so Next.js never caches Supabase responses. */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    global: {
      fetch: (input, init = {}) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export type Entry = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  entry_date: string;
  tags?: string[];
};

export type ScrapbookUpload = {
  id: string;
  original_url: string | null;
  processed_url: string;
  entry_date: string;
  created_at: string;
};
