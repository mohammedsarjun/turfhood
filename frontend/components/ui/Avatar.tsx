import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  /** Image URL; when absent, an anonymous-user placeholder icon is shown instead of initials. */
  src?: string;
  alt?: string;
  /** Sizing/color classes for the placeholder icon (ignored when `src` is set). */
  iconClassName?: string;
}

/** Fills its parent's rounded container — parent controls size via its own className. */
export function Avatar({ src, alt = '', iconClassName }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded avatar, arbitrary origin
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    );
  }

  return (
    <UserRound
      className={cn('h-2/3 w-2/3 text-muted-foreground', iconClassName)}
      aria-hidden="true"
    />
  );
}
