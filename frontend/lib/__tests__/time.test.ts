import { formatTime12Hour, fromRailwayTime, toRailwayTime } from '../time';

describe('time utilities', () => {
  it('converts AM/PM input to railway time for storage', () => {
    expect(toRailwayTime(12, 0, 'AM')).toBe('00:00');
    expect(toRailwayTime(12, 30, 'PM')).toBe('12:30');
    expect(toRailwayTime(7, 45, 'PM')).toBe('19:45');
  });

  it('converts stored railway time for display', () => {
    expect(fromRailwayTime('00:00')).toEqual({ hour: 12, minute: 0, meridiem: 'AM' });
    expect(formatTime12Hour('19:45')).toBe('7:45 PM');
  });
});
