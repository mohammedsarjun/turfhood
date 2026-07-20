'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { useIconUpload } from '../hooks/useIconUpload';
import type { SportsType } from '../types';

export interface IconUploadProps {
  sport: SportsType;
  onUpdated: (item: SportsType) => void;
}

export function IconUpload({ sport, onUpdated }: IconUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { previewUrl, isUploading, error, handleFileChange } = useIconUpload(sport.id, onUpdated);

  const displayUrl = previewUrl ?? sport.icon;

  return (
    <div className="flex flex-col items-center" style={{ gap: 8 }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-border bg-muted"
        aria-label="Change sport icon"
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary Cloudinary-hosted icon
          <img src={displayUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
          {isUploading ? (
            <Spinner size="sm" className="text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
