'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { Avatar, Spinner } from '@/components/ui';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import type { PublicUser } from '../types';

interface AvatarUploadProps {
  profile: PublicUser;
  onUpdated: (user: PublicUser) => void;
}

export function AvatarUpload({ profile, onUpdated }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { previewUrl, isUploading, error, handleFileChange } = useAvatarUpload(onUpdated);

  const displayUrl = previewUrl ?? profile.avatarUrl;

  return (
    <div className="flex flex-col items-center" style={{ gap: 8 }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted"
        aria-label="Change profile picture"
      >
        <Avatar src={displayUrl} iconClassName="h-10 w-10" />
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
