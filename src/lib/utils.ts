
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts various Google Drive share links to a direct, embeddable image link.
 * @param url The Google Drive share URL.
 * @returns A direct image link or the original URL if it's not a valid GDrive link.
 */
export function convertGoogleDriveLink(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Regex to extract file ID from common Google Drive URL patterns:
  // 1. drive.google.com/file/d/FILE_ID/...
  // 2. drive.google.com/uc?id=FILE_ID...
  // 3. lh3.googleusercontent.com/d/FILE_ID...
  const fileIdMatch = url.match(
    /(?:drive\.google\.com\/(?:file\/d\/|uc\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/
  );

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Return the original URL if it doesn't match a known Google Drive pattern
  return url;
}
