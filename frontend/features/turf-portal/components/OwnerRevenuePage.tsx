'use client';
import { useMemo, useState } from 'react';
import { Pagination } from '@/components/table';
import { getOwnerRevenue } from '../actions/ownerRevenueApi';
import { FiCalendar, FiDownload, FiDollarSign, FiPercent, FiTrendingUp } from 'react-icons/fi';
import { Button, Input, Spinner, useToast } from '@/components/ui';
import { useOwnerRevenue } from '../hooks/useOwnerRevenue';
import { exportRevenuePdf } from '../lib/exportRevenuePdf';
const localDate = (value = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(value);
const ago = (days: number) => localDate(new Date(Date.now() - days * 86_400_000));
const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
type Range = 'today' | 'week' | 'month' | 'year' | 'custom';
export function OwnerRevenuePage({ turfId }: { turfId: string }) {
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);
  const today = localDate();
  const [range, setRange] = useState<Range>('month');
  const [customStart, setCustomStart] = useState(`${today.slice(0, 7)}-01`);
  const [customEnd, setCustomEnd] = useState(today);
  const [dateError, setDateError] = useState<string>();
  const dates =
    range === 'today'
      ? [today, today]
      : range === 'week'
        ? [ago(6), today]
        : range === 'month'
          ? [`${today.slice(0, 7)}-01`, today]
          : range === 'year'
            ? [`${today.slice(0, 4)}-01-01`, today]
            : [customStart, customEnd];
  const validDates = Boolean(dates[0] && dates[1] && dates[0] <= dates[1]);
  const { report, loading, error, retry, page, setPage } = useOwnerRevenue(
    turfId,
    validDates ? dates[0] : today,
    validDates ? dates[1] : today,
  );
  const commissionRate = report?.selectedRange.summary.grossRevenuePaise
    ? (report.selectedRange.summary.commissionPaise /
        report.selectedRange.summary.grossRevenuePaise) *
      100
    : 0;
  const chartPoints = report ? buildChartPoints(report.trend, range, dates[0], dates[1]) : [];
  const cards = report
    ? [
        {
          label: 'Gross revenue',
          value: money(report.selectedRange.summary.grossRevenuePaise),
          note: `${report.selectedRange.summary.bookings} paid bookings`,
          icon: FiTrendingUp,
        },
        {
          label: 'Platform commission',
          value: money(report.selectedRange.summary.commissionPaise),
          note: `${commissionRate.toFixed(1)}% of booking revenue`,
          icon: FiPercent,
        },
        {
          label: 'Net earnings',
          value: money(report.selectedRange.summary.netEarningsPaise),
          note: 'Your earnings after commission',
          icon: FiDollarSign,
        },
      ]
    : [];
  async function exportReport() {
    setExporting(true);
    try {
      exportRevenuePdf(await getOwnerRevenue(turfId, dates[0], dates[1]));
      showToast('Revenue report exported.');
    } catch {
      showToast('Unable to export revenue report.', 'error');
    } finally {
      setExporting(false);
    }
  }
  function selectRange(value: Range) {
    setRange(value);
    setDateError(undefined);
  }
  function validateCustom() {
    if (!customStart || !customEnd) setDateError('Choose both start and end dates.');
    else if (customStart > customEnd) setDateError('Start date must be before the end date.');
    else setDateError(undefined);
  }
  if (loading && !report)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  if (!report || error)
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <p>{error ?? 'Unable to load revenue.'}</p>
        <Button className="mt-4" onClick={() => void retry()}>
          Try again
        </Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">FINANCE</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Revenue overview</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track earnings and platform fees for {report.turfName}.
          </p>
        </div>
        <Button variant="outline" loading={exporting} onClick={() => void exportReport()}>
          <FiDownload />
          Download PDF
        </Button>
      </div>
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(['today', 'week', 'month', 'year', 'custom'] as Range[]).map((item) => (
            <button
              key={item}
              onClick={() => selectRange(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${range === item ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {item === 'week'
                ? 'Last 7 days'
                : item === 'month'
                  ? 'This month'
                  : item === 'year'
                    ? 'This year'
                    : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        {range === 'custom' && (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
            <label className="text-sm font-medium">
              Start date
              <Input
                type="date"
                className="mt-1"
                max={today}
                value={customStart}
                onChange={(event) => {
                  setCustomStart(event.target.value);
                  setDateError(undefined);
                }}
              />
            </label>
            <label className="text-sm font-medium">
              End date
              <Input
                type="date"
                className="mt-1"
                max={today}
                value={customEnd}
                onChange={(event) => {
                  setCustomEnd(event.target.value);
                  setDateError(undefined);
                }}
              />
            </label>
            <Button className="sm:mt-6" onClick={validateCustom}>
              Apply range
            </Button>
            {dateError && (
              <p role="alert" className="text-xs text-destructive sm:col-span-3">
                {dateError}
              </p>
            )}
          </div>
        )}
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <Snapshot
          label="Today"
          value={report.snapshots.today.netEarningsPaise}
          bookings={report.snapshots.today.bookings}
        />
        <Snapshot
          label="Last 7 days"
          value={report.snapshots.last7Days.netEarningsPaise}
          bookings={report.snapshots.last7Days.bookings}
        />
        <Snapshot
          label="This month"
          value={report.snapshots.thisMonth.netEarningsPaise}
          bookings={report.snapshots.thisMonth.bookings}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ icon: Icon, ...card }) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div className="rounded-xl bg-success p-3 text-success-foreground">
                <Icon />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{card.note}</p>
          </div>
        ))}
      </div>
      <div className={`grid gap-6 ${range === 'today' ? '' : 'lg:grid-cols-[1.6fr_1fr]'}`}>
        {range !== 'today' && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Earnings trend</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Net earnings across the selected period
            </p>
            <RevenueChart points={chartPoints} />
          </section>
        )}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Booking status</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Confirmed, cancelled and completed bookings
          </p>
          <BookingStatusChart {...report.bookingStatus} />
        </section>
      </div>
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold">Revenue details</h2>
          <p className="mt-1 text-xs text-muted-foreground">Every paid booking in this period</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Date / booking</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Court</th>
                <th className="p-4 text-right">Gross</th>
                <th className="p-4 text-right">Commission</th>
                <th className="p-4 text-right">Net earnings</th>
              </tr>
            </thead>
            <tbody>
              {report.transactions.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="p-4">
                    <strong>{item.bookingDate}</strong>
                    <span className="block text-xs text-muted-foreground">{item.reference}</span>
                  </td>
                  <td className="p-4">{item.customerName}</td>
                  <td className="p-4">{item.courtName}</td>
                  <td className="p-4 text-right">{money(item.grossRevenuePaise)}</td>
                  <td className="p-4 text-right text-destructive">
                    -{money(item.commissionPaise)}
                  </td>
                  <td className="p-4 text-right font-semibold text-success-foreground">
                    {money(item.netEarningsPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {report.pagination && (
            <Pagination
              page={page}
              totalPages={report.pagination.totalPages}
              onPageChange={setPage}
              disabled={loading}
            />
          )}
          {!report.transactions.length && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <FiCalendar className="mx-auto mb-3" size={28} />
              No paid bookings in this period.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
function RevenueChart({ points }: { points: { label: string; value: number }[] }) {
  const [hovered, setHovered] = useState<number>();
  const chart = useMemo(() => {
    const values = points.length ? points : [{ label: '', value: 0 }];
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
            <strong className="mt-0.5 block whitespace-nowrap">{money(active.value)} earned</strong>
          </div>
        )}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--primary)" stopOpacity=".3" />
              <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M 0 92 ${chart.map((point) => `L ${point.x} ${point.y}`).join(' ')} L 100 92 Z`}
            fill="url(#revenue-fill)"
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
            aria-label={`${point.label}: ${money(point.value)} earned`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(undefined)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(undefined)}
            className="absolute z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-card shadow-sm transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span className="sr-only">{money(point.value)} earned</span>
          </button>
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
function BookingStatusChart({
  booked,
  cancelled,
  completed,
}: {
  booked: number;
  cancelled: number;
  completed: number;
}) {
  const total = booked + cancelled + completed;
  const bookedEnd = total ? (booked / total) * 100 : 0;
  const completedEnd = total ? bookedEnd + (completed / total) * 100 : 0;
  return (
    <div className="mt-8 flex flex-col items-center">
      <div
        className="grid h-44 w-44 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#3b82f6 0 ${bookedEnd}%, var(--primary) ${bookedEnd}% ${completedEnd}%, #ef4444 ${completedEnd}% 100%)`,
        }}
      >
        <div className="grid h-28 w-28 place-items-center rounded-full bg-card text-center">
          <div>
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">bookings</p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center text-xs">
        <Status label="Booked" value={booked} color="bg-blue-500" />
        <Status label="Completed" value={completed} color="bg-primary" />
        <Status label="Cancelled" value={cancelled} color="bg-red-500" />
      </div>
    </div>
  );
}
function Status({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <span className={`mx-auto mb-1 block h-2 w-2 rounded-full ${color}`} />
      <strong className="block text-base">{value}</strong>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
function Snapshot({ label, value, bookings }: { label: string; value: number; bookings: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold">{money(value)}</p>
      </div>
      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
        {bookings} bookings
      </span>
    </div>
  );
}
function buildChartPoints(
  trend: { date: string; netEarningsPaise: number }[],
  range: Range,
  start: string,
  end: string,
) {
  const amounts = new Map(trend.map((point) => [point.date, point.netEarningsPaise]));
  if (range === 'year')
    return Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, '0');
      const prefix = `${start.slice(0, 4)}-${month}`;
      return {
        label: new Date(`${prefix}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short' }),
        value: trend
          .filter((point) => point.date.startsWith(prefix))
          .reduce((sum, point) => sum + point.netEarningsPaise, 0),
      };
    });
  if (range === 'month')
    return Array.from({ length: 5 }, (_, index) => ({
      label: `Week ${index + 1}`,
      value: trend
        .filter((point) => Math.floor((Number(point.date.slice(8, 10)) - 1) / 7) === index)
        .reduce((sum, point) => sum + point.netEarningsPaise, 0),
    }));
  const days = Math.max(
    1,
    Math.round(
      (new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) /
        86_400_000,
    ) + 1,
  );
  if (range === 'week' || days <= 31)
    return Array.from({ length: days }, (_, index) => {
      const value = new Date(`${start}T00:00:00`);
      value.setDate(value.getDate() + index);
      const key = localDate(value);
      return {
        label:
          range === 'week' ? value.toLocaleDateString('en-IN', { weekday: 'short' }) : key.slice(5),
        value: amounts.get(key) ?? 0,
      };
    });
  return trend.map((point) => ({ label: point.date.slice(5), value: point.netEarningsPaise }));
}
