import { CURRENCIES } from './currencies';

// Helper: fetch with timeout
async function fetchWithTimeout(resource: string, options: any = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Helper to get date string for time filter
function getDateForFilter(filter: string): string {
  const now = new Date();
  switch (filter) {
    case '1D':
      now.setDate(now.getDate() - 1);
      break;
    case '1W':
      now.setDate(now.getDate() - 7);
      break;
    case '1M':
      now.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      now.setMonth(now.getMonth() - 3);
      break;
    case '6M':
      now.setMonth(now.getMonth() - 6);
      break;
    case '1Y':
      now.setFullYear(now.getFullYear() - 1);
      break;
    case 'YTD':
      return `${now.getFullYear()}-01-01`;
    case 'All':
      return '2000-01-01';
    default:
      return '';
  }
  return now.toISOString().slice(0, 10);
}

// Helper to get previous business day from Frankfurter API
async function getPreviousBusinessDay(latestDate: string): Promise<string> {
  // Go back up to 7 days to find a different business day
  for (let i = 1; i <= 7; i++) {
    const d = new Date(latestDate);
    d.setDate(d.getDate() - i);
    const tryDate = d.toISOString().slice(0, 10);
    // Frankfurter will return the closest previous business day if the date is a holiday/weekend
    const res = await fetch(`https://api.frankfurter.app/${tryDate}`);
    if (!res.ok) continue;
    const data = await res.json();
    if (data.date && data.date !== latestDate) {
      return data.date;
    }
  }
  return latestDate; // fallback
}

// Fetch rates from Exchangerate.host
export async function getForexMatrix(filter: string = '1D') {
  try {
    // BYPASS REDIS: No caching for local/dev


    const baseCodes = CURRENCIES.map(c => c.code);
    // Get the latest business day from Frankfurter
    const latestRes = await fetchWithTimeout(`https://api.frankfurter.app/latest`);
    const latestData = await latestRes.json();
    const latestDate = latestData.date;

    // Use the filter to get the comparison date
    let compareDate = getDateForFilter(filter);
    // If compareDate is after latestDate, fallback to previous business day
    if (compareDate >= latestDate) {
      compareDate = await getPreviousBusinessDay(latestDate);
    }

    // Fetch current rates for latest business day
    const currentRates: Record<string, Record<string, number>> = {};
    for (const base of baseCodes) {
      try {
        const res = await fetchWithTimeout(`https://api.frankfurter.app/${latestDate}?from=${base}&to=${baseCodes.join(',')}`);
        if (!res.ok) throw new Error(`Failed to fetch current rates for ${base}`);
        const data = await res.json();
        if (!data.rates) throw new Error(`No rates in current data for ${base}`);
        currentRates[base] = data.rates;
      } catch (err) {
        console.error(`Current rates error for ${base}:`, err);
        currentRates[base] = {};
      }
    }

    // Fetch previous rates for the selected filter date (or fallback)
    const prevRates: Record<string, Record<string, number>> = {};
    for (const base of baseCodes) {
      try {
        const res = await fetchWithTimeout(`https://api.frankfurter.app/${compareDate}?from=${base}&to=${baseCodes.join(',')}`);
        if (!res.ok) throw new Error(`Failed to fetch previous rates for ${base}`);
        const data = await res.json();
        if (!data.rates) throw new Error(`No rates in previous data for ${base}`);
        prevRates[base] = data.rates;
      } catch (err) {
        console.error(`Previous rates error for ${base}:`, err);
        prevRates[base] = {};
      }
    }

    // Build matrix
    const matrix = baseCodes.map(base => {
      return baseCodes.map(quote => {
        if (base === quote) return null;
        const curr = currentRates[base][quote];
        const prev = prevRates[base][quote];
        if (!curr || !prev) return null;
        const changePercent = ((curr - prev) / prev) * 100;
        return {
          base,
          quote,
          changePercent: Number(changePercent.toFixed(2)),
        };
      });
    });

    return matrix;
  } catch (err: any) {
    console.error('getForexMatrix error:', err);
    throw err;
  }
}
