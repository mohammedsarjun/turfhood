'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@/components/table';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarCheck,
  CircleDollarSign,
  FileClock,
  IndianRupee,
  MapPinned,
  RefreshCcw,
  ShieldAlert,
  UsersRound,
} from 'lucide-react';
import type { AdminDashboardDTO } from '@turfhood/shared';
import { Badge, Button, Card, CardContent, Heading, Spinner, useToast } from '@/components/ui';
import { getAdminDashboard } from '../actions/adminDashboardApi';

const money = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardDTO>();
  const [page, setPage] = useState(1);
  const [refreshing, setLoading] = useState(false);
  const [loadedPage, setLoadedPage] = useState(0);
  const loading = refreshing || loadedPage !== page;
  const { showToast } = useToast();
  const refresh = async () => {
    setLoading(true);
    try {
      setData(await getAdminDashboard(page));
    } catch {
      showToast('Unable to load admin dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    void getAdminDashboard(page)
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => active && showToast('Unable to load admin dashboard.', 'error'))
      .finally(() => {
        if (active) setLoadedPage(page);
      });
    return () => {
      active = false;
    };
  }, [showToast, page]);
  const maxRevenue = useMemo(
    () => Math.max(1, ...(data?.trends.map((item) => item.revenuePaise) ?? [])),
    [data],
  );
  if (loading && !data)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  if (!data)
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p>Dashboard data is unavailable.</p>
          <Button className="mt-4" onClick={() => void refresh()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  const bookingTotal = Math.max(
    1,
    data.confirmedBookings + data.completedBookings + data.cancelledBookings,
  );
  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-700 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-emerald-200">Platform overview</p>
            <Heading variant="h1" className="mt-1 text-white">
              Good to see you, Admin
            </Heading>
            <p className="mt-2 max-w-xl text-sm text-emerald-100">
              Monitor marketplace health, revenue, booking activity, and items requiring attention.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            loading={loading}
            onClick={() => void refresh()}
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
        <div className="relative mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat
            label="Gross booking value"
            value={money(data.grossRevenuePaise)}
            icon={IndianRupee}
          />
          <HeroStat
            label="Platform commission"
            value={money(data.platformCommissionPaise)}
            icon={CircleDollarSign}
          />
          <HeroStat
            label="Bookings"
            value={data.totalBookings.toLocaleString('en-IN')}
            icon={CalendarCheck}
          />
          <HeroStat
            label="Active customers"
            value={data.totalCustomers.toLocaleString('en-IN')}
            icon={UsersRound}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Approved turfs" value={data.approvedTurfs} icon={MapPinned} />
        <Metric label="Turf owners" value={data.totalOwners} icon={UsersRound} />
        <Metric label="Active open sessions" value={data.activeOpenSessions} icon={CalendarCheck} />
        <Metric
          label="Completion rate"
          value={`${Math.round((data.completedBookings / bookingTotal) * 100)}%`}
          icon={ArrowUpRight}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <Card>
          <CardContent className="py-6">
            <div>
              <h2 className="text-lg font-semibold">Revenue momentum</h2>
              <p className="text-sm text-muted-foreground">
                Successful bookings over the last six months
              </p>
            </div>
            <div className="mt-7 flex h-64 items-end gap-3 border-b border-border px-2">
              {data.trends.map((point) => (
                <div
                  key={point.month}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="relative flex w-full flex-1 items-end justify-center">
                    <div
                      className="w-full max-w-14 rounded-t-xl bg-gradient-to-t from-primary to-emerald-400 transition group-hover:brightness-110"
                      style={{ height: `${Math.max(5, (point.revenuePaise / maxRevenue) * 100)}%` }}
                    >
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg group-hover:block">
                        {money(point.revenuePaise)} · {point.bookings} bookings
                      </div>
                    </div>
                  </div>
                  <span className="pb-3 text-xs text-muted-foreground">{point.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold">Needs attention</h2>
            <p className="text-sm text-muted-foreground">Operational tasks waiting for review</p>
            <div className="mt-5 space-y-3">
              <ActionCard
                href="/admin/turf-owner-applications"
                label="Pending turf applications"
                count={data.pendingApplications}
                icon={FileClock}
                urgent={data.pendingApplications > 0}
              />
              <ActionCard
                href="/admin/refunds"
                label="Escalated refunds"
                count={data.escalatedRefunds}
                icon={ShieldAlert}
                urgent={data.escalatedRefunds > 0}
              />
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cancelled bookings</span>
                  <strong>{data.cancelledBookings}</strong>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{
                      width: `${Math.min(100, (data.cancelledBookings / bookingTotal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent booking activity</h2>
              <p className="text-sm text-muted-foreground">
                Latest transactions across the platform
              </p>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-y border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Turf</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Play date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 font-medium">
                      {booking.reference}
                      {booking.bookingType === 'open_session' && (
                        <Badge variant="outline" className="ml-2">
                          Open
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4">{booking.turfName}</td>
                    <td className="px-4 py-4 text-muted-foreground">{booking.customerName}</td>
                    <td className="px-4 py-4">
                      {new Date(`${booking.bookingDate}T00:00:00`).toLocaleDateString('en-IN', {
                        dateStyle: 'medium',
                      })}
                    </td>
                    <td className="px-4 py-4 font-semibold">{money(booking.amountPaise)}</td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          booking.status === 'completed'
                            ? 'success'
                            : booking.status.includes('cancelled')
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {booking.status.replaceAll('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.pagination && (
              <Pagination
                page={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
                disabled={loading}
              />
            )}
            {data.recentBookings.length === 0 && (
              <p className="py-10 text-center text-muted-foreground">No booking activity yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HeroStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof IndianRupee;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <Icon className="h-5 w-5 text-emerald-200" />
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-emerald-100">{label}</p>
    </div>
  );
}
function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof IndianRupee;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <span className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function ActionCard({
  href,
  label,
  count,
  icon: Icon,
  urgent,
}: {
  href: string;
  label: string;
  count: number;
  icon: typeof AlertTriangle;
  urgent: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary"
    >
      <span
        className={`rounded-xl p-2 ${urgent ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <strong>{count}</strong>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
