'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TurfImageGalleryImage {
  url: string;
  isCover?: boolean;
}

export interface TurfImageGalleryProps {
  images: TurfImageGalleryImage[];
  /** Used for the main image's alt text and, combined with position, each thumbnail's. */
  altText: string;
  className?: string;
}

/**
 * Main photo + a scrollable strip of thumbnails below it — click a thumbnail to make it the main
 * photo. Used anywhere turf photos are reviewed (admin verification, the owner's turf detail
 * view), so this lives in `components/shared` rather than a single feature folder.
 */
export function TurfImageGallery({ images, altText, className }: TurfImageGalleryProps) {
  const coverIndex = images.findIndex((image) => image.isCover);
  const [activeIndex, setActiveIndex] = useState(coverIndex >= 0 ? coverIndex : 0);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'flex h-72 w-full items-center justify-center rounded-md bg-muted',
          className,
        )}
      >
        <ImageIcon className="h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  const activeImage = images[Math.min(activeIndex, images.length - 1)];

  return (
    <div className={className}>
      <div className="mb-2 h-72 w-full overflow-hidden rounded-md bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage elsewhere in this repo */}
        <img src={activeImage?.url} alt={altText} className="h-full w-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="flex overflow-x-auto" style={{ gap: 8 }}>
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden rounded-md border-2',
                index === activeIndex ? 'border-primary' : 'border-transparent',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage elsewhere in this repo */}
              <img
                src={image.url}
                alt={`${altText} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
