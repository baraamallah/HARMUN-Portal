import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a Google Drive share link to a direct, embeddable image link.
 * @param url The Google Drive share URL.
 * @returns A direct image link or the original URL if it's not a valid GDrive link.
 */
export function convertGoogleDriveLink(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Check if it's already a direct link
  if (url.startsWith('https://lh3.googleusercontent.com/d/')) {
    return url;
  }
  
  // Regex to extract file ID from '.../file/d/FILE_ID/...'
  const fileIdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Return the original URL if no match is found
  return url;
}
