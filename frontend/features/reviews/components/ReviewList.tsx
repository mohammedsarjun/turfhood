import type { ReviewDTO, ReviewSummaryDTO } from '@turfhood/shared';
import { StarRating } from './StarRating';

export function ReviewList({
  items,
  summary,
  showTurfName = false,
}: {
  items: ReviewDTO[];
  summary: ReviewSummaryDTO;
  showTurfName?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <strong className="text-2xl">{summary.average.toFixed(1)}</strong>
        <StarRating rating={summary.average} />
        <span className="text-sm text-muted-foreground">
          {summary.count} review{summary.count === 1 ? '' : 's'}
        </span>
      </div>
      {items.length ? (
        <div className="mt-5 space-y-4">
          {items.map((review) => (
            <article key={review.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{review.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {showTurfName ? `${review.turfName} - ` : ''}
                    {review.courtName}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{review.comment}</p>
              <time
                className="mt-3 block text-xs text-muted-foreground"
                dateTime={review.createdAt}
              >
                {new Date(review.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </time>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No reviews yet.
        </p>
      )}
    </div>
  );
}
