export type Meridiem = 'AM' | 'PM';

export function toRailwayTime(hour12: number, minute: number, meridiem: Meridiem): string {
  const hour24 = (hour12 % 12) + (meridiem === 'PM' ? 12 : 0);
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function fromRailwayTime(value: string): { hour: number; minute: number; meridiem: Meridiem } | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  const hour24 = Number(match[1]);
  return {
    hour: hour24 % 12 || 12,
    minute: Number(match[2]),
    meridiem: hour24 >= 12 ? 'PM' : 'AM',
  };
}

export function formatTime12Hour(value: string): string {
  const parsed = fromRailwayTime(value);
  if (!parsed) return value;
  return `${parsed.hour}:${String(parsed.minute).padStart(2, '0')} ${parsed.meridiem}`;
}
