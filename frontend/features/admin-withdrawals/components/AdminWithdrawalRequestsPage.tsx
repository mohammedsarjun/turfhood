'use client';

import { useEffect, useState } from 'react';
import type { WithdrawalRequestDTO, WithdrawalRequestStatus } from '@turfhood/shared';
import { Pagination } from '@/components/table';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Heading,
  Modal,
  Spinner,
  Textarea,
  useToast,
} from '@/components/ui';
import {
  listWithdrawalRequests,
  markWithdrawalPaid,
  rejectWithdrawal,
} from '../actions/withdrawalRequestsApi';

type FilterStatus = WithdrawalRequestStatus | 'all';

const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);

export function AdminWithdrawalRequestsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<WithdrawalRequestDTO[]>([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<FilterStatus>('pending');
  const [totalPages, setTotalPages] = useState(1);
  const [loadedKey, setLoadedKey] = useState('');
  const [revision, setRevision] = useState(0);
  const [updatingId, setUpdatingId] = useState<string>();
  const [rejecting, setRejecting] = useState<WithdrawalRequestDTO>();
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const requestKey = `${page}:${status}:${revision}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;
    void listWithdrawalRequests(page, status)
      .then((result) => {
        if (!active) return;
        if (page > result.pagination.totalPages) {
          setPage(Math.max(1, result.pagination.totalPages));
          return;
        }
        setItems(result.items);
        setTotalPages(result.pagination.totalPages);
      })
      .catch(() => active && showToast('Unable to load withdrawal requests.', 'error'))
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [page, requestKey, revision, showToast, status]);

  const chooseStatus = (value: FilterStatus) => {
    setStatus(value);
    setPage(1);
  };

  const pay = async (request: WithdrawalRequestDTO) => {
    setUpdatingId(request.id);
    try {
      await markWithdrawalPaid(request.id);
      setRevision((current) => current + 1);
      showToast('Withdrawal marked as paid.');
    } catch {
      showToast('Unable to mark withdrawal as paid.', 'error');
    } finally {
      setUpdatingId(undefined);
    }
  };

  const submitRejection = async () => {
    if (!rejecting) return;
    if (reason.trim().length < 5) {
      setReasonError('Mention why the request is rejected.');
      return;
    }
    setUpdatingId(rejecting.id);
    try {
      await rejectWithdrawal(rejecting.id, { reason: reason.trim() });
      setRejecting(undefined);
      setReason('');
      setRevision((current) => current + 1);
      showToast('Withdrawal request rejected.');
    } catch {
      showToast('Unable to reject withdrawal request.', 'error');
    } finally {
      setUpdatingId(undefined);
    }
  };

  return (
    <div>
      <Heading variant="h1">Withdrawal requests</Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        Review turf-owner payout requests and update their payment status.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(['pending', 'paid', 'rejected', 'all'] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={status === value ? 'primary' : 'outline'}
            onClick={() => chooseStatus(value)}
          >
            {value[0].toUpperCase() + value.slice(1)}
          </Button>
        ))}
      </div>
      <Card className="mt-6 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[13%]" />
                  <col className="w-[26%]" />
                  <col className="w-[13%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Owner / Turf</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Bank details</th>
                    <th className="px-4 py-3 whitespace-nowrap font-medium">Requested</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border align-top last:border-0">
                      <td className="px-4 py-4">
                        <span className="block truncate font-medium" title={item.ownerName}>
                          {item.ownerName}
                        </span>
                        <span
                          className="block truncate text-xs text-muted-foreground"
                          title={item.turfName}
                        >
                          {item.turfName}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums">
                        {money(item.amountPaise)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="block truncate font-medium"
                          title={item.bankAccount.accountHolderName}
                        >
                          {item.bankAccount.accountHolderName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.bankAccount.bankName} - {item.bankAccount.accountType}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          A/C{' '}
                          {item.bankAccount.accountNumber ?? item.bankAccount.accountNumberMasked}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          IFSC {item.bankAccount.ifscCode}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {new Date(item.requestedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={badgeVariant(item.status)}>{item.status}</Badge>
                        {item.rejectionReason && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-destructive">
                            {item.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {item.status === 'pending' && (
                          <div className="inline-flex flex-col gap-2">
                            <Button
                              size="sm"
                              loading={updatingId === item.id}
                              onClick={() => void pay(item)}
                            >
                              Mark paid
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRejecting(item);
                                setReason('');
                                setReasonError('');
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!items.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                        No withdrawal requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {!loading && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      <Modal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(undefined)}
        title="Reject request"
      >
        <Textarea
          placeholder="Incorrect bank details, bank could not receive money..."
          value={reason}
          errorMessage={reasonError}
          onChange={(event) => {
            setReason(event.target.value);
            setReasonError('');
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setRejecting(undefined)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={Boolean(rejecting && updatingId === rejecting.id)}
            onClick={() => void submitRejection()}
          >
            Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function badgeVariant(status: WithdrawalRequestStatus) {
  if (status === 'paid') return 'success';
  if (status === 'rejected') return 'destructive';
  return 'warning';
}
