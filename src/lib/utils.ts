import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertGoogleDriveLink(url: string): string {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }
  
  // Regex to extract the file ID from a standard Google Drive share link
  const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    const fileId = match[1];
    // Use the reliable lh3.googleusercontent.com domain for direct image embedding
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  // Return original URL if it doesn't match the expected format
  return url;
}
