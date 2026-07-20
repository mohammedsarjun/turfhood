'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { validateImageFile } from '@/lib/validateImageFile';

export interface IconPickerProps {
  onFileSelected: (file: File) => void;
  /** Server/form-level error (e.g. "please select an icon") shown when no local validation error is active. */
  errorMessage?: string;
}

/** Lets the admin pick+preview an icon before submitting the Add form — the file is uploaded together with the rest of the form, not immediately. */
export function IconPicker({ onFileSelected, errorMessage }: IconPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setLocalError(validation.error ?? 'Invalid image file.');
      return;
    }

    setLocalError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  };

  return (
    <div className="flex flex-col items-center" style={{ gap: 8 }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-border bg-muted"
        aria-label="Select icon image"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, never uploaded as-is
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-6 w-6 text-muted-foreground" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {(localError ?? errorMessage) && (
        <p role="alert" className="text-xs text-destructive">
          {localError ?? errorMessage}
        </p>
      )}
    </div>
  );
}
