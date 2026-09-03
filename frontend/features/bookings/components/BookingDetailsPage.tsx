'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { BookingDTO, ReviewDTO } from '@turfhood/shared';
import { Header } from '@/components/shared';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Modal,
  Spinner,
  useToast,
} from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatTime12Hour } from '@/lib/time';
import {
  cancelMyBooking,
  getMyBooking,
  retryBookingPayment,
  submitPaymentForm,
} from '../actions/bookingApi';
import { ApiError } from '@/types/api/response';
import { createBookingReview, getBookingReview } from '@/features/reviews/actions/reviewApi';
import { StarRating, StarRatingInput } from '@/features/reviews';
export function BookingDetailsPage({ id }: { id: string }) {
  const { user, clearUser } = useCurrentUser();
  const [booking, setBooking] = useState<BookingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [review, setReview] = useState<ReviewDTO | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const { showToast } = useToast();
  useEffect(() => {
    void Promise.all([getMyBooking(id), getBookingReview(id)])
      .then(([bookingResult, reviewResult]) => {
        setBooking(bookingResult);
        setReview(reviewResult);
      })
      .catch(() => showToast('Unable to load booking.', 'error'))
      .finally(() => setLoading(false));
  }, [id, showToast]);
  const cancel = async () => {
    setCancelling(true);
    try {
      setBooking(await cancelMyBooking(id, cancelReason.trim() || undefined));
      setCancelOpen(false);
      showToast('Booking cancelled. Refund status is shown below.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Cancellation failed.', 'error');
    } finally {
      setCancelling(false);
    }
  };
  const submitReview = async () => {
    if (!rating || comment.trim().length < 3) {
      showToast('Choose a rating and enter at least 3 characters.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const created = await createBookingReview(id, { rating, comment: comment.trim() });
      setReview(created);
      showToast('Thanks! Your review is now published.');
    } catch (caught) {
      showToast(caught instanceof ApiError ? caught.message : 'Unable to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };
  const retry = async () => {
    setRetrying(true);
    try {
      const result = await retryBookingPayment(id);
      submitPaymentForm(result.payment);
    } catch (caught) {
      showToast(
        caught instanceof ApiError ? caught.message : 'These slots are no longer available.',
        'error',
      );
      setRetrying(false);
    }
  };
  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : booking ? (
          <>
            <Link href="/bookings" className="text-sm text-primary">
              ← My bookings
            </Link>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{booking.reference}</p>
                <h1 className="text-3xl font-bold">{booking.turfName}</h1>
              </div>
              <Badge
                variant={
                  booking.status === 'confirmed'
                    ? 'success'
                    : booking.status.includes('cancelled')
                      ? 'destructive'
                      : 'warning'
                }
              >
                {booking.status.replaceAll('_', ' ')}
              </Badge>
            </div>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{booking.courtName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  {new Date(`${booking.bookingDate}T00:00:00`).toLocaleDateString('en-IN', {
                    dateStyle: 'full',
                  })}
                </p>
                <p>
                  {booking.slots
                    .map(
                      (slot) =>
                        `${formatTime12Hour(slot.startTime)}–${formatTime12Hour(slot.endTime)}`,
                    )
                    .join(', ')}
                </p>
                <p>{booking.address}</p>
                <div className="border-t pt-4">
                  <p className="flex justify-between">
                    <span>Customer paid</span>
                    <strong>₹{(booking.finalAmountPaise / 100).toFixed(2)}</strong>
                  </p>
                  <p className="mt-2 flex justify-between text-muted-foreground">
                    <span>Payment</span>
                    <span>{booking.paymentStatus.replaceAll('_', ' ')}</span>
                  </p>
                  {booking.cancellation && (
                    <p className="mt-2 flex justify-between">
                      <span>Refund</span>
                      <strong>₹{(booking.cancellation.refundPaise / 100).toFixed(2)}</strong>
                    </p>
                  )}
                </div>
                {booking.status === 'confirmed' && (
                  <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                    Cancel booking
                  </Button>
                )}
                {(booking.status === 'payment_failed' || booking.status === 'expired') && (
                  <Button loading={retrying} onClick={() => void retry()}>
                    Retry payment
                  </Button>
                )}
              </CardContent>
            </Card>
            {booking.status === 'completed' && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your court review</CardTitle>
                </CardHeader>
                <CardContent>
                  {review ? (
                    <div className="space-y-3">
                      <StarRating rating={review.rating} />
                      <p className="whitespace-pre-wrap text-sm">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        Review submitted for {review.courtName}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-sm font-medium">Rate {booking.courtName}</p>
                        <StarRatingInput
                          value={rating}
                          onChange={setRating}
                          disabled={submittingReview}
                        />
                      </div>
                      <label className="block text-sm font-medium">
                        Comment
                        <textarea
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                          rows={4}
                          maxLength={1000}
                          disabled={submittingReview}
                          className="mt-2 w-full rounded-lg border border-input bg-background p-3 font-normal"
                          placeholder="How was the court and your playing experience?"
                        />
                      </label>
                      <Button loading={submittingReview} onClick={() => void submitReview()}>
                        Submit review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel booking">
              <div className="space-y-4">
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
                  Your refund is calculated automatically: full at least 24 hours before play, 50%
                  between 6 and 24 hours, and no refund within 6 hours. The 10-minute grace period
                  applies before play starts.
                </div>
                <label className="block text-sm font-medium">
                  Reason (optional)
                  <textarea
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-input bg-background p-3 font-normal"
                    placeholder="Tell us why you are cancelling"
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCancelOpen(false)}>
                    Keep booking
                  </Button>
                  <Button variant="destructive" loading={cancelling} onClick={() => void cancel()}>
                    Confirm cancellation
                  </Button>
                </div>
              </div>
            </Modal>
          </>
        ) : (
          <p>Booking not found.</p>
        )}
      </main>
    </>
  );
}
