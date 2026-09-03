import { Star } from 'lucide-react';

export function StarRating({ rating, label }: { rating: number; label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label={label ?? `${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
        />
      ))}
    </span>
  );
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        return (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
            disabled={disabled}
            onClick={() => onChange(rating)}
            className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Star
              className={`h-7 w-7 ${rating <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
            />
          </button>
        );
      })}
    </div>
  );
}
