'use client';

import { Select } from './Select';
import { fromRailwayTime, toRailwayTime, type Meridiem } from '@/lib/time';
import { cn } from '@/lib/utils';

interface TimeInputProps {
  value: string;
  onChange: (railwayTime: string) => void;
  ariaLabel: string;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
}

const hours = Array.from({ length: 12 }, (_, index) => index + 1);
const minutes = Array.from({ length: 60 }, (_, index) => index);

export function TimeInput({ value, onChange, ariaLabel, errorMessage, disabled, className }: TimeInputProps) {
  const parsed = fromRailwayTime(value);
  const hour = parsed?.hour ?? 12;
  const minute = parsed?.minute ?? 0;
  const meridiem = parsed?.meridiem ?? 'AM';

  const update = (nextHour: number, nextMinute: number, nextMeridiem: Meridiem) => {
    onChange(toRailwayTime(nextHour, nextMinute, nextMeridiem));
  };

  return (
    <div className={cn(className)}>
      <div className="grid min-w-0 grid-cols-[minmax(3.5rem,1fr)_minmax(3.5rem,1fr)_minmax(4.5rem,1fr)] gap-2">
        <Select
          aria-label={`${ariaLabel} hour`}
          value={String(hour)}
          disabled={disabled}
          onChange={(event) => update(Number(event.target.value), minute, meridiem)}
          options={hours.map((item) => ({ value: String(item), label: String(item) }))}
          className="h-10 px-2 pr-7"
        />
        <Select
          aria-label={`${ariaLabel} minute`}
          value={String(minute)}
          disabled={disabled}
          onChange={(event) => update(hour, Number(event.target.value), meridiem)}
          options={minutes.map((item) => ({
            value: String(item),
            label: String(item).padStart(2, '0'),
          }))}
          className="h-10 px-2 pr-7"
        />
        <Select
          aria-label={`${ariaLabel} AM or PM`}
          value={meridiem}
          disabled={disabled}
          onChange={(event) => update(hour, minute, event.target.value as Meridiem)}
          options={[{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }]}
          className="h-10 px-2 pr-7"
        />
      </div>
      {errorMessage && <p role="alert" className="mt-1.5 text-xs text-destructive">{errorMessage}</p>}
    </div>
  );
}
