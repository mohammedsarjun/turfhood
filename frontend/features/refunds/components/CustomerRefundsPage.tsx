'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, ReceiptText } from 'lucide-react';
import type { CustomerRefundDTO } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Badge, Card, CardContent, Heading, Spinner, useToast } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { listMyRefunds } from '@/features/open-sessions/actions/openSessionApi';

const statusVariant = (status: CustomerRefundDTO['status']) => {
  if (status === 'refunded' || status === 'partially_refunded') return 'success' as const;
  if (status === 'failed' || status === 'escalated') return 'destructive' as const;
  return 'warning' as const;
};

export function CustomerRefundsPage() {
  const { user, clearUser } = useCurrentUser();
  const { showToast } = useToast();
  const [items, setItems] = useState<CustomerRefundDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listMyRefunds()
      .then((result) => setItems(result.items))
      .catch(() => showToast('Unable to load your refunds.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Heading variant="h1">My Refunds</Heading>
        <p className="mt-2 text-muted-foreground">
          Track refunds from court bookings and open-session payments.
        </p>
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            <ReceiptText className="mx-auto mb-3 h-10 w-10" />
            You do not have any refunds yet.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {items.map((refund) => (
              <Card key={`${refund.source}-${refund.id}`}>
                <CardContent className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong>{refund.reference}</strong>
                        <Badge variant="outline">
                          {refund.source === 'open_session' ? 'Open session' : 'Booking'}
                        </Badge>
                        <Badge variant={statusVariant(refund.status)}>
                          {refund.status.replaceAll('_', ' ')}
                        </Badge>
                      </div>
                      <h2 className="mt-2 text-lg font-semibold">
                        {refund.turfName} - {refund.courtName}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">{refund.reason}</p>
                    </div>
                    <p className="text-xl font-bold">₹{(refund.amountPaise / 100).toFixed(2)}</p>
                  </div>
                  <div className="mt-5 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Detail label="Attempts" value={String(refund.attemptCount)} />
                    <Detail label="Escalated" value={refund.escalated ? 'Yes' : 'No'} />
                    <Detail
                      label="Payment reference"
                      value={refund.paymentReference ?? 'Not available'}
                    />
                    <Detail label="Refund reference" value={refund.refundReference ?? 'Pending'} />
                  </div>
                  {refund.failureReason && (
                    <p className="mt-4 flex gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="h-5 w-5 shrink-0" /> {refund.failureReason}
                    </p>
                  )}
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    {refund.completedAt ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock3 className="h-4 w-4" />
                    )}
                    {refund.completedAt
                      ? `Completed ${new Date(refund.completedAt).toLocaleString('en-IN')}`
                      : refund.requestedAt
                        ? `Requested ${new Date(refund.requestedAt).toLocaleString('en-IN')}`
                        : `Created ${new Date(refund.createdAt).toLocaleString('en-IN')}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-medium">{value}</p>
    </div>
  );
}
