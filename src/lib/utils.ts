import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertGoogleDriveLink(url: string): string {
  if (!url || typeof url !== 'string' || !url.includes("drive.google.com")) {
    return url;
  }
  // Extracts file ID from URLs like:
  // - drive.google.com/file/d/FILE_ID/view
  // - drive.google.com/file/d/FILE_ID
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return url;
}
