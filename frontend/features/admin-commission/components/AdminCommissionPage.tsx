'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { IndianRupee, Percent, Store } from 'lucide-react';
import { updateCommissionSchema } from '@turfhood/shared';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Spinner,
  useToast,
} from '@/components/ui';
import { ApiError } from '@/types/api/response';
import { updateCommissionSetting } from '../actions/commissionApi';
import { useCommissionSetting } from '../hooks/useCommissionSetting';

const EXAMPLE_BOOKING_AMOUNT = 1000;

export function AdminCommissionPage() {
  const { setting, setSetting, loading, error, reload } = useCommissionSetting();
  const [percentageInput, setPercentageInput] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const percentage = percentageInput ?? String(setting?.percentage ?? '');

  const preview = useMemo(() => {
    const value = Number(percentage);
    const validPercentage = Number.isFinite(value) && value >= 1 && value <= 50 ? value : 0;
    const commission = (EXAMPLE_BOOKING_AMOUNT * validPercentage) / 100;
    return { commission, ownerEarnings: EXAMPLE_BOOKING_AMOUNT - commission };
  }, [percentage]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = updateCommissionSchema.safeParse({ percentage: Number(percentage) });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Enter a valid commission percentage.');
      return;
    }
    setSaving(true);
    setFieldError('');
    try {
      const updated = await updateCommissionSetting(result.data);
      setSetting(updated);
      setPercentageInput(null);
      showToast('Commission percentage updated successfully.');
    } catch (caught) {
      showToast(
        caught instanceof ApiError ? caught.message : 'Failed to update commission.',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-72 items-center justify-center">
        <Spinner />
      </div>
    );
  if (!setting)
    return (
      <div>
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
        <Button variant="outline" onClick={() => void reload()}>
          Try again
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Heading variant="h1">Commission Management</Heading>
        <p className="mt-2 text-sm text-muted-foreground">
          Set the percentage Turfhood earns from every completed booking.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Platform commission</CardTitle>
            <p className="text-sm text-muted-foreground">
              Deduct this rate from the listed slot price before settling the remainder with the
              turf owner.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => void submit(event)} className="space-y-5">
              <label htmlFor="commission-percentage" className="block text-sm font-medium">
                Commission percentage
              </label>
              <Input
                id="commission-percentage"
                type="number"
                min="1"
                max="50"
                step="0.01"
                value={percentage}
                onChange={(event) => {
                  setPercentageInput(event.target.value);
                  setFieldError('');
                }}
                errorMessage={fieldError}
                rightSlot={<Percent className="h-4 w-4 text-muted-foreground" />}
              />
              <p className="text-xs text-muted-foreground">
                Accepted range: 1% to 50%, with up to two decimal places.
              </p>
              <Button
                type="submit"
                loading={saving}
                disabled={Number(percentage) === setting.percentage}
              >
                Save commission
              </Button>
            </form>
            {setting.updatedAt && (
              <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                Last updated {new Date(setting.updatedAt).toLocaleString('en-IN')}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>₹1,000 booking example</CardTitle>
            <p className="text-sm text-muted-foreground">
              The customer pays ₹1,000. Preview how that amount is split.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <PreviewRow icon={IndianRupee} label="Booking amount" value={EXAMPLE_BOOKING_AMOUNT} />
            <PreviewRow
              icon={Percent}
              label="Turfhood commission"
              value={preview.commission}
              highlight
            />
            <PreviewRow icon={Store} label="Turf owner earnings" value={preview.ownerEarnings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof Percent;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg p-4 ${highlight ? 'bg-primary/10 text-primary' : 'bg-muted'}`}
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <strong>
        ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </strong>
    </div>
  );
}
