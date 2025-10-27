"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { uploadImage } from '@/lib/firebase-service';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  category?: 'hero' | 'gallery' | 'profile' | 'general';
  currentImageUrl?: string;
  maxSizeMB?: number;
  aspectRatio?: string;
  className?: string;
}

/**
 * Image uploader component with drag-and-drop support
 * Uploads directly to Firebase Storage
 */
export function ImageUploader({
  onUploadComplete,
  category = 'general',
  currentImageUrl,
  maxSizeMB = 5,
  aspectRatio,
  className,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);

      // Validate file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase
      try {
        setUploading(true);
        setProgress(30);

        const downloadURL = await uploadImage(file, category);

        setProgress(100);
        onUploadComplete(downloadURL);

        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setPreview(currentImageUrl || null);
        setUploading(false);
        setProgress(0);
      }
    },
    [category, maxSizeMB, onUploadComplete, currentImageUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          uploading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {!uploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  clearPreview();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-8">
            {uploading ? (
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            ) : (
              <>
                {isDragActive ? (
                  <Upload className="h-12 w-12 text-primary mb-4" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                )}
              </>
            )}
            <p className="text-sm font-medium mb-1">
              {uploading
                ? 'Uploading...'
                : isDragActive
                ? 'Drop image here'
                : 'Drag & drop image here'}
            </p>
            <p className="text-xs text-muted-foreground">
              {uploading ? `${progress}% complete` : `or click to browse (max ${maxSizeMB}MB)`}
            </p>
            {aspectRatio && !uploading && (
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: {aspectRatio} aspect ratio
              </p>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <Progress value={progress} className="h-2" />
      )}

      {/* Error message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* File type info */}
      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, GIF, WebP
      </p>
    </div>
  );
}
