'use client';

import { useEffect, useState } from 'react';
import { Pagination } from '@/components/table';
import type { BookingDTO } from '@turfhood/shared';
import { Badge, Button, Card, CardContent, Heading, Spinner, useToast } from '@/components/ui';
import { ApiError } from '@/types/api/response';
import { listEscalatedRefunds, verifyManualRefund } from '../actions/refundApi';

export function AdminRefundsPage() {
  const [items, setItems] = useState<BookingDTO[]>([]);
  const [requestIds, setRequestIds] = useState<Record<string, string>>({});
  const [loadedKey, setLoadedKey] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [revision, setRevision] = useState(0);
  const [verifyingId, setVerifyingId] = useState<string>();
  const { showToast } = useToast();

  const requestKey = `${page}:${revision}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;
    void listEscalatedRefunds(page)
      .then((result) => {
        if (!active) return;
        if (page > result.pagination.totalPages) {
          setPage(Math.max(1, result.pagination.totalPages));
          return;
        }
        setItems(result.items);
        setTotalPages(result.pagination.totalPages);
      })
      .catch(() => active && showToast('Unable to load escalated refunds.', 'error'))
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [showToast, page, revision, requestKey]);

  const verify = async (booking: BookingDTO) => {
    const requestId = requestIds[booking.id]?.trim();
    if (!requestId) return showToast('Enter the PayU refund request ID.', 'error');
    setVerifyingId(booking.id);
    try {
      const updated = await verifyManualRefund(booking.id, requestId);
      setRevision((current) => current + 1);
      showToast(
        updated.paymentStatus === 'refund_pending'
          ? 'PayU refund is pending and will be checked automatically.'
          : 'Refund verified successfully.',
      );
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Unable to verify refund.', 'error');
    } finally {
      setVerifyingId(undefined);
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
      <Heading variant="h1">Escalated refunds</Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        Refunds that need manual review after automatic retries or a permanent PayU rejection.
      </p>
      <div className="mt-6 space-y-4">
        {items.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No refunds require admin action.
            </CardContent>
          </Card>
        )}
        {items.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="space-y-3 py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>{booking.reference}</strong>
                  <p className="text-sm text-muted-foreground">
                    {booking.customerName} - {booking.turfName}
                  </p>
                </div>
                <Badge variant="destructive">
                  {booking.refund?.attemptCount ?? 0} automatic{' '}
                  {(booking.refund?.attemptCount ?? 0) === 1 ? 'attempt' : 'attempts'}
                </Badge>
              </div>
              <p className="text-sm">
                Refund: INR{' '}
                {((booking.cancellation?.refundPaise ?? booking.finalAmountPaise) / 100).toFixed(2)}
              </p>
              <p className="text-sm text-destructive">{booking.refund?.failureReason}</p>
              {booking.refund?.failureReason?.includes('PayU error 105:') && (
                <p className="text-sm text-muted-foreground">
                  PayU rejected the amount. Check the captured payment and any previous partial or
                  manual refunds in PayU before creating a refund in the dashboard.
                </p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="PayU dashboard refund request ID"
                  value={requestIds[booking.id] ?? ''}
                  onChange={(event) =>
                    setRequestIds((current) => ({ ...current, [booking.id]: event.target.value }))
                  }
                />
                <Button loading={verifyingId === booking.id} onClick={() => void verify(booking)}>
                  Verify refund
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!loading && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
