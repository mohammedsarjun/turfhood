'use client';

import { useRef, useState, type ChangeEvent, type FC } from 'react';
import CropperImpl, { type CropperProps, type Area } from 'react-easy-crop';
import { Image as ImageIcon, Star, Trash2, Upload } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { validateImageFile } from '@/lib/validateImageFile';
import { cropImageToBlob } from '../lib/cropImageToBlob';

// react-easy-crop ships class-component typings that TS 5's JSX checker doesn't accept as-is
// under this project's React 19 types, and its props (rotation, minZoom, cropShape, …) all have
// library-side defaults — cast once to a component accepting only the props this form sets.
const Cropper = CropperImpl as unknown as FC<
  Pick<
    CropperProps,
    'image' | 'crop' | 'zoom' | 'aspect' | 'onCropChange' | 'onZoomChange' | 'onCropComplete'
  >
>;

export interface TurfImageEntry {
  file: File;
  previewUrl: string;
  isCover: boolean;
}

export interface TurfImageUploadProps {
  images: TurfImageEntry[];
  onChange: (images: TurfImageEntry[]) => void;
  errorMessage?: string;
}

const ASPECT_RATIO = 16 / 9;

/** Pick → crop (fixed 16:9, output 1280x720) → add to the list; one image must be marked cover. */
export function TurfImageUpload({ images, onChange, errorMessage }: TurfImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

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
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPendingSrc(URL.createObjectURL(file));
  };

  const closeCropModal = () => {
    if (pendingSrc) URL.revokeObjectURL(pendingSrc);
    setPendingSrc(null);
  };

  const confirmCrop = async () => {
    if (!pendingSrc || !croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const blob = await cropImageToBlob(pendingSrc, croppedAreaPixels);
      const file = new File([blob], `turf-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      const isFirstImage = images.length === 0;
      onChange([...images, { file, previewUrl, isCover: isFirstImage }]);
      closeCropModal();
    } finally {
      setIsCropping(false);
    }
  };

  const setCover = (index: number) => {
    onChange(images.map((image, i) => ({ ...image, isCover: i === index })));
  };

  const removeAt = (index: number) => {
    const removed = images[index];
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={images.length >= 10}
      >
        <Upload className="h-4 w-4" />
        Add Photo
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ marginTop: 12 }}>
          {images.map((image, index) => (
            <div
              key={image.previewUrl}
              className="relative overflow-hidden rounded-md border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, never uploaded as-is */}
              <img src={image.previewUrl} alt="" className="aspect-video w-full object-cover" />
              <button
                type="button"
                onClick={() => setCover(index)}
                aria-label={image.isCover ? 'Cover photo' : 'Set as cover photo'}
                className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
              >
                <Star className={image.isCover ? 'h-4 w-4 fill-current text-warning' : 'h-4 w-4'} />
              </button>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {image.isCover && (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="mt-3 flex h-32 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
        </div>
      )}

      {(localError ?? errorMessage) && (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {localError ?? errorMessage}
        </p>
      )}

      <Modal open={Boolean(pendingSrc)} onClose={closeCropModal} title="Crop Photo">
        {pendingSrc && (
          <>
            <div className="relative h-72 w-full">
              <Cropper
                image={pendingSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT_RATIO}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>
            <div className="flex items-center justify-end" style={{ gap: 8, marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={closeCropModal}>
                Cancel
              </Button>
              <Button type="button" loading={isCropping} onClick={() => void confirmCrop()}>
                Use Photo
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
