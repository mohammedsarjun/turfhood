'use client';
import { useEffect, useState } from 'react';
import type { BookingDTO } from '@turfhood/shared';
import { Badge, Button, Heading, Modal, Spinner, useToast } from '@/components/ui';
import { formatTime12Hour } from '@/lib/time';
import { cancelOwnerBooking, listOwnerBookings } from '../actions/bookingApi';
export function OwnerBookingsPage({ turfId }: { turfId: string }) {
  const [items, setItems] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingToCancel, setBookingToCancel] = useState<BookingDTO | null>(null);
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();
  useEffect(() => {
    void listOwnerBookings(turfId)
      .then((result) => setItems(result.items))
      .catch(() => showToast('Unable to load bookings.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast, turfId]);
  const cancel = async () => {
    if (!bookingToCancel || !reason.trim()) return;
    setCancelling(true);
    try {
      const updated = await cancelOwnerBooking(turfId, bookingToCancel.id, reason.trim());
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setBookingToCancel(null);
      setReason('');
      showToast('Booking cancelled and full refund requested.');
    } catch {
      showToast('Unable to cancel booking.', 'error');
    } finally {
      setCancelling(false);
    }
  };
  if (loading)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  return (
    <div>
      <Heading variant="h1">Bookings</Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        Upcoming and historical bookings for this turf.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-4">Booking</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Schedule</th>
              <th className="p-4">Owner earnings</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="p-4">
                  <strong>{item.reference}</strong>
                  <span className="block text-muted-foreground">{item.courtName}</span>
                </td>
                <td className="p-4">
                  {item.customerName}
                  <span className="block text-muted-foreground">{item.customerPhone}</span>
                </td>
                <td className="p-4">
                  {item.bookingDate}
                  <span className="block text-muted-foreground">
                    {item.slots.map((slot) => formatTime12Hour(slot.startTime)).join(', ')}
                  </span>
                </td>
                <td className="p-4">₹{(item.ownerEarningsPaise / 100).toFixed(2)}</td>
                <td className="p-4">
                  <Badge variant={item.status === 'confirmed' ? 'success' : 'outline'}>
                    {item.status.replaceAll('_', ' ')}
                  </Badge>
                </td>
                <td className="p-4">
                  {item.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setBookingToCancel(item)}
                    >
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        title="Cancel customer booking"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The customer receives a full refund and the selected slots reopen for booking.
          </p>
          <label className="block text-sm font-medium">
            Cancellation reason
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-input bg-background p-3 font-normal"
              placeholder="Maintenance, weather, or another reason"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBookingToCancel(null)}>
              Keep booking
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim()}
              loading={cancelling}
              onClick={() => void cancel()}
            >
              Cancel and refund
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
