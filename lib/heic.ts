"use client";

import heic2any from "heic2any";

const HEIC_TYPES = ["image/heic", "image/heif"];

export function isHeic(file: File): boolean {
  return HEIC_TYPES.includes(file.type);
}

/**
 * If the file is HEIC/HEIF (e.g. from iPhone), convert to JPEG so Remove.bg and
 * Supabase Storage accept it. Otherwise return the file unchanged.
 */
export async function ensureImageFileForUpload(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  const result = await heic2any({ blob: file, toType: "image/jpeg" });
  const blob = Array.isArray(result) ? result[0] : result;
  const name = file.name.replace(/\.[^.]+$/i, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}
