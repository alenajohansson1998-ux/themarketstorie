import { DateTime } from 'luxon';

const NY = 'America/New_York';
const OPEN_MINUTE = 9 * 60 + 30;
const CLOSE_MINUTE = 16 * 60;

// Full-day NYSE closures. Early (1 PM) closes are not modelled.
const NYSE_HOLIDAYS = new Set([
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25',
  '2026-06-19', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25',
  '2027-01-01', '2027-01-18', '2027-02-15', '2027-03-26', '2027-05-31',
  '2027-06-18', '2027-07-05', '2027-09-06', '2027-11-25', '2027-12-24',
]);

function isTradingDay(day: DateTime): boolean {
  return day.weekday <= 5 && !NYSE_HOLIDAYS.has(day.toISODate() ?? '');
}

function nextTradingDay(from: DateTime): DateTime {
  let day = from.plus({ days: 1 }).startOf('day');
  for (let i = 0; i < 10 && !isTradingDay(day); i++) {
    day = day.plus({ days: 1 });
  }
  return day;
}

export interface MarketStatus {
  open: boolean;
  /** Full label, e.g. "NYSE open · closes 4:00 PM ET" */
  label: string;
  /** Short label for narrow screens, e.g. "NYSE open" */
  short: string;
}

export function getNyseStatus(now: DateTime = DateTime.now()): MarketStatus {
  const ny = now.setZone(NY);
  const minute = ny.hour * 60 + ny.minute;

  if (isTradingDay(ny) && minute >= OPEN_MINUTE && minute < CLOSE_MINUTE) {
    return { open: true, label: 'NYSE open · closes 4:00 PM ET', short: 'NYSE open' };
  }

  if (isTradingDay(ny) && minute < OPEN_MINUTE) {
    return { open: false, label: 'NYSE closed · opens 9:30 AM ET', short: 'NYSE closed' };
  }

  const next = nextTradingDay(ny);
  const isTomorrow = next.hasSame(ny.plus({ days: 1 }), 'day');
  const when = isTomorrow ? 'tomorrow' : next.toFormat('ccc');
  return { open: false, label: `NYSE closed · opens ${when} 9:30 AM ET`, short: 'NYSE closed' };
}
