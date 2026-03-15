"use client";

import heic2any from "heic2any";

const HEIC_TYPES = ["image/heic", "image/heic-sequence", "image/heif", "image/heif-sequence"];
const HEIC_EXTENSIONS = /\.(heic|heif|heics|heifs)$/i;

export function isHeic(file: File): boolean {
  const type = file.type?.toLowerCase();
  if (type && HEIC_TYPES.includes(type)) return true;
  return HEIC_EXTENSIONS.test(file.name);
}

/**
 * If the file is HEIC/HEIF (e.g. from iPhone), convert to JPEG so Remove.bg and
 * Supabase Storage accept it. Otherwise return the file unchanged.
 * If conversion fails (e.g. unsupported HEIC variant), returns the original file
 * so the server can return a clear error.
 */
export async function ensureImageFileForUpload(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  try {
    const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(result) ? result[0] : result;
    if (!blob || !(blob instanceof Blob)) return file;
    const name = file.name.replace(/\.[^.]+$/i, ".jpg");
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
