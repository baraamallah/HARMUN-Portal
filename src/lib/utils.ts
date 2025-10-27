
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from 'dompurify'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: Return as is (will be sanitized on client)
    return html
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4',
      'ul', 'ol', 'li', 'blockquote', 'a', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
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
