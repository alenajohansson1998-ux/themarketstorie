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

const NY_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: NY,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

interface NewYorkDateParts {
  year: number;
  month: number;
  day: number;
  weekday: string;
  hour: number;
  minute: number;
}

function getNewYorkParts(date: Date): NewYorkDateParts {
  const parts = Object.fromEntries(
    NY_DATE_FORMAT.formatToParts(date).map(({ type, value }) => [type, value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: parts.weekday,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function dateKey({ year, month, day }: Pick<NewYorkDateParts, 'year' | 'month' | 'day'>): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isTradingDay(day: NewYorkDateParts): boolean {
  return day.weekday !== 'Sat' && day.weekday !== 'Sun' && !NYSE_HOLIDAYS.has(dateKey(day));
}

function nextTradingDay(from: NewYorkDateParts): NewYorkDateParts {
  // Noon UTC always maps to the same New York calendar date, including across DST changes.
  const cursor = new Date(Date.UTC(from.year, from.month - 1, from.day + 1, 12));
  for (let i = 0; i < 10; i += 1) {
    const day = getNewYorkParts(cursor);
    if (isTradingDay(day)) return day;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return getNewYorkParts(cursor);
}

export interface MarketStatus {
  open: boolean;
  /** Full label, e.g. "NYSE open · closes 4:00 PM ET" */
  label: string;
  /** Short label for narrow screens, e.g. "NYSE open" */
  short: string;
}

export function getNyseStatus(now: Date = new Date()): MarketStatus {
  const ny = getNewYorkParts(now);
  const minute = ny.hour * 60 + ny.minute;

  if (isTradingDay(ny) && minute >= OPEN_MINUTE && minute < CLOSE_MINUTE) {
    return { open: true, label: 'NYSE open · closes 4:00 PM ET', short: 'NYSE open' };
  }

  if (isTradingDay(ny) && minute < OPEN_MINUTE) {
    return { open: false, label: 'NYSE closed · opens 9:30 AM ET', short: 'NYSE closed' };
  }

  const next = nextTradingDay(ny);
  const tomorrow = getNewYorkParts(new Date(Date.UTC(ny.year, ny.month - 1, ny.day + 1, 12)));
  const isTomorrow = dateKey(next) === dateKey(tomorrow);
  const when = isTomorrow ? 'tomorrow' : next.weekday;
  return { open: false, label: `NYSE closed · opens ${when} 9:30 AM ET`, short: 'NYSE closed' };
}
