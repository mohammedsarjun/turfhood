'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pagination } from '@/components/table';
import {
  ArrowDownRight,
  CalendarRange,
  CircleDollarSign,
  HandCoins,
  IndianRupee,
} from 'lucide-react';
import type { AdminRevenueReportDTO } from '@turfhood/shared';
import { Badge, Button, Card, CardContent, Heading, Spinner, useToast } from '@/components/ui';
import { getAdminRevenue } from '../actions/adminRevenueApi';

type Preset = 'today' | 'week' | 'month' | 'year' | 'custom';
const indiaDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
const today = () => indiaDate(new Date());
const rangeFor = (preset: Exclude<Preset, 'custom'>) => {
  const endDate = today();
  const now = new Date();
  if (preset === 'today') return { startDate: endDate, endDate };
  if (preset === 'week')
    return { startDate: indiaDate(new Date(now.getTime() - 6 * 86400000)), endDate };
  if (preset === 'month') return { startDate: `${endDate.slice(0, 7)}-01`, endDate };
  return { startDate: `${endDate.slice(0, 4)}-01-01`, endDate };
};
const money = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AdminRevenuePage() {
  const [preset, setPreset] = useState<Preset>('month');
  const initial = rangeFor('month');
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [data, setData] = useState<AdminRevenueReportDTO>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const fetchReport = async (start = startDate, end = endDate, page = 1) => {
    setLoading(true);
    try {
      setData(await getAdminRevenue(start, end, page));
    } catch {
      showToast('Unable to load platform revenue.', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const range = rangeFor('month');
    void getAdminRevenue(range.startDate, range.endDate)
      .then(setData)
      .catch(() => showToast('Unable to load platform revenue.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);
  const choosePreset = (value: Exclude<Preset, 'custom'>) => {
    const range = rangeFor(value);
    setPreset(value);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    void fetchReport(range.startDate, range.endDate);
  };
  const chartPoints = useMemo(
    () => (data ? buildChartPoints(data.trend, preset, startDate, endDate) : []),
    [data, endDate, preset, startDate],
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
        <CardContent className="py-12 text-center">Revenue report is unavailable.</CardContent>
      </Card>
    );
  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-7 shadow-sm sm:px-8">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-primary/10 p-3 text-primary">
            <CircleDollarSign className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Finance
            </p>
            <Heading variant="h1" className="mt-1">
              Platform Revenue
            </Heading>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A clear view of booking income, platform commission, and owner payouts.
            </p>
          </div>
        </div>
        <div className="mt-7 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
          <Hero label="Commission today" value={money(data.snapshots.todayCommissionPaise)} />
          <Hero label="This month" value={money(data.snapshots.monthCommissionPaise)} />
          <Hero label="This year" value={money(data.snapshots.yearCommissionPaise)} />
        </div>
      </section>
      <Card>
        <CardContent className="py-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex gap-2">
              {(['today', 'week', 'month', 'year'] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={preset === value ? 'primary' : 'outline'}
                  onClick={() => choosePreset(value)}
                >
                  {value === 'week'
                    ? 'Last 7 days'
                    : value === 'month'
                      ? 'This month'
                      : value === 'year'
                        ? 'This year'
                        : 'Today'}
                </Button>
              ))}
            </div>
            <label className="text-xs font-medium text-muted-foreground">
              From
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(event) => {
                  setPreset('custom');
                  setStartDate(event.target.value);
                }}
                className="mt-1 block rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground">
              To
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={today()}
                onChange={(event) => {
                  setPreset('custom');
                  setEndDate(event.target.value);
                }}
                className="mt-1 block rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <Button
              size="sm"
              disabled={!startDate || !endDate || startDate > endDate}
              onClick={() => void fetchReport()}
            >
              Apply range
            </Button>
          </div>
        </CardContent>
      </Card>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Gross booking value"
          value={money(data.summary.grossRevenuePaise)}
          icon={IndianRupee}
        />
        <Metric
          label="Commission earned"
          value={money(data.summary.commissionPaise)}
          icon={CircleDollarSign}
          highlight
        />
        <Metric
          label="Paid to turf owners"
          value={money(data.summary.ownerPayoutPaise)}
          icon={HandCoins}
        />
        <Metric
          label="Average commission"
          value={`${data.summary.averageCommissionPercentage}%`}
          icon={ArrowDownRight}
        />
      </section>
      <section className={`grid gap-6 ${preset === 'today' ? '' : 'xl:grid-cols-[1.5fr_0.5fr]'}`}>
        {preset !== 'today' && (
          <Card>
            <CardContent className="py-6">
              <h2 className="text-lg font-semibold">Commission trend</h2>
              <p className="text-sm text-muted-foreground">
                Platform commission across the selected period
              </p>
              <RevenueChart points={chartPoints} />
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold">Revenue mix</h2>
            <div className="mt-6 space-y-5">
              <Mix
                label="Private bookings"
                value={data.bookingTypes.private}
                total={data.summary.bookings}
              />
              <Mix
                label="Open sessions"
                value={data.bookingTypes.openSession}
                total={data.summary.bookings}
              />
              <div className="rounded-2xl bg-primary/10 p-4">
                <CalendarRange className="h-5 w-5 text-primary" />
                <p className="mt-3 text-2xl font-bold">{data.summary.bookings}</p>
                <p className="text-sm text-muted-foreground">Revenue-generating bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardContent className="py-6">
          <h2 className="text-lg font-semibold">Commission transactions</h2>
          <p className="text-sm text-muted-foreground">
            Booking-level breakdown for the selected range
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-y border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Turf / Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Gross</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Owner payout</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 font-medium">
                      {item.reference}
                      {item.bookingType === 'open_session' && (
                        <Badge variant="outline" className="ml-2">
                          Open
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="block font-medium">{item.turfName}</span>
                      <span className="text-xs text-muted-foreground">{item.customerName}</span>
                    </td>
                    <td className="px-4 py-4">{item.bookingDate}</td>
                    <td className="px-4 py-4">{money(item.grossRevenuePaise)}</td>
                    <td className="px-4 py-4">{item.commissionPercentage}%</td>
                    <td className="px-4 py-4 font-bold text-emerald-700">
                      {money(item.commissionPaise)}
                    </td>
                    <td className="px-4 py-4">{money(item.ownerPayoutPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.pagination && (
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={(page) =>
                  void fetchReport(data.range.startDate, data.range.endDate, page)
                }
                disabled={loading}
              />
            )}
            {!data.transactions.length && (
              <p className="py-10 text-center text-muted-foreground">
                No commission transactions found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
function Hero({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/55 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

type ChartPoint = { label: string; value: number; gross: number };

function RevenueChart({ points }: { points: ChartPoint[] }) {
  const [hovered, setHovered] = useState<number>();
  const chart = useMemo(() => {
    const values = points.length ? points : [{ label: '', value: 0, gross: 0 }];
    const max = Math.max(...values.map((point) => point.value), 1);
    return values.map((point, index) => ({
      ...point,
      x: values.length === 1 ? 50 : (index / (values.length - 1)) * 100,
      y: 92 - (point.value / max) * 78,
    }));
  }, [points]);
  const active = hovered === undefined ? undefined : chart[hovered];
  return (
    <div className="mt-6">
      <div className="relative h-64 w-full">
        {active && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg"
            style={{ left: `${active.x}%`, top: `${active.y}%` }}
          >
            <span className="block opacity-70">{active.label}</span>
            <strong className="mt-0.5 block whitespace-nowrap">
              {money(active.value)} commission
            </strong>
            <span className="mt-0.5 block whitespace-nowrap opacity-70">
              {money(active.gross)} booking value
            </span>
          </div>
        )}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="admin-revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--primary)" stopOpacity=".3" />
              <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M 0 92 ${chart.map((point) => `L ${point.x} ${point.y}`).join(' ')} L 100 92 Z`}
            fill="url(#admin-revenue-fill)"
          />
          <polyline
            points={chart.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {chart.map((point, index) => (
          <button
            key={`${point.label}-${point.x}`}
            type="button"
            aria-label={`${point.label}: ${money(point.value)} commission`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(undefined)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(undefined)}
            className="absolute z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-card shadow-sm transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {chart.slice(0, 6).map((point) => (
          <span key={`${point.label}-${point.x}`}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

function buildChartPoints(
  trend: AdminRevenueReportDTO['trend'],
  preset: Preset,
  start: string,
  end: string,
): ChartPoint[] {
  const total = (items: typeof trend, field: 'commissionPaise' | 'grossRevenuePaise') =>
    items.reduce((sum, point) => sum + point[field], 0);
  if (preset === 'year')
    return Array.from({ length: 12 }, (_, index) => {
      const prefix = `${start.slice(0, 4)}-${String(index + 1).padStart(2, '0')}`;
      const items = trend.filter((point) => point.date.startsWith(prefix));
      return {
        label: new Date(`${prefix}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short' }),
        value: total(items, 'commissionPaise'),
        gross: total(items, 'grossRevenuePaise'),
      };
    });
  if (preset === 'month')
    return Array.from({ length: 5 }, (_, index) => {
      const items = trend.filter(
        (point) => Math.floor((Number(point.date.slice(8, 10)) - 1) / 7) === index,
      );
      return {
        label: `Week ${index + 1}`,
        value: total(items, 'commissionPaise'),
        gross: total(items, 'grossRevenuePaise'),
      };
    });
  const days = Math.max(
    1,
    Math.round(
      (new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) /
        86_400_000,
    ) + 1,
  );
  if (preset === 'week' || days <= 31) {
    const amounts = new Map(trend.map((point) => [point.date, point]));
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(`${start}T00:00:00`);
      date.setDate(date.getDate() + index);
      const key = indiaDate(date);
      const point = amounts.get(key);
      return {
        label:
          preset === 'week' ? date.toLocaleDateString('en-IN', { weekday: 'short' }) : key.slice(5),
        value: point?.commissionPaise ?? 0,
        gross: point?.grossRevenuePaise ?? 0,
      };
    });
  }
  return trend.map((point) => ({
    label: point.date.slice(5),
    value: point.commissionPaise,
    gross: point.grossRevenuePaise,
  }));
}

function Metric({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: typeof IndianRupee;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary/40 bg-primary/5' : ''}>
      <CardContent className="flex items-center gap-4 py-5">
        <span className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function Mix({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <strong>
          {value} ({percent}%)
        </strong>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
