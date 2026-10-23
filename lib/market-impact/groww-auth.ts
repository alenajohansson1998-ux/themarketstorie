import { createHash } from 'node:crypto';

// This module is used only by the server-side market-data adapter. Credentials
// and generated tokens never become part of a response or a client component.
const TOKEN_URL = 'https://api.groww.in/v1/token/api/access';
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const MAX_RESPONSE_BYTES = 64 * 1_024;
const MAX_CREDENTIAL_LENGTH = 8_192;
const EXPIRY_MARGIN = 30_000;
const IST_OFFSET = 330 * MINUTE;
const AUTH_FAILURE = 'Groww authentication was not accepted. Check the server credentials and approve the API key on Groww for today.';
const AUTH_UNAVAILABLE = 'Groww authentication is temporarily unavailable. Try again shortly.';
const REJECTED_ACCESS = 'Groww access was rejected. Check the access token or approve the API key on Groww for today.';

export interface GrowwAccess {
  token: string | null;
  reason: string | null;
}

interface CredentialState {
  fingerprint: string;
  generated: boolean;
  token: string | null;
  expiresAt: number;
  failureUntil: number;
  failureReason: string | null;
  pending: Promise<GrowwAccess> | null;
}

let active: CredentialState | null = null;
// Retained across credential rotation so changing a key cannot reset the local
// budget. Groww's documented provider limit is 150 auth requests per 24 hours.
let authenticationRequests: number[] = [];

function unavailable(reason: string): GrowwAccess {
  return { token: null, reason };
}

function validCredential(value: string): boolean {
  return value.length <= MAX_CREDENTIAL_LENGTH && !/[\u0000-\u0020\u007f]/.test(value);
}

function fingerprint(parts: string[]): string {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

function stateFor(value: string, generated: boolean): CredentialState {
  if (active?.fingerprint !== value) {
    active = { fingerprint: value, generated, token: null, expiresAt: 0, failureUntil: 0, failureReason: null, pending: null };
  }
  return active;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function jwtExpiry(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !/^[A-Za-z0-9_-]+$/.test(parts[1])) return null;
  try {
    const payload = record(JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')));
    const expiry = payload?.exp;
    return typeof expiry === 'number' && Number.isFinite(expiry) && expiry > 0 && expiry * 1_000 <= 8.64e15
      ? expiry * 1_000 : null;
  } catch {
    return null;
  }
}

function explicitExpiry(value: unknown): number | null {
  // The documentation's zoneless example cannot be interpreted in the host's
  // timezone. Only an explicit offset or Z is used as an expiry claim.
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function nextDailyExpiry(now: number): number {
  const ist = now + IST_OFFSET;
  let boundary = Math.floor(ist / DAY) * DAY + 6 * 60 * MINUTE;
  if (boundary <= ist) boundary += DAY;
  return boundary - IST_OFFSET;
}

function usableUntil(payload: Record<string, unknown>, token: string, now: number): number {
  const expiryClaims = [explicitExpiry(payload.expiry), jwtExpiry(token)].filter((value): value is number => value !== null);
  // A token without a reliable expiry is cached for at most ten minutes. The
  // daily boundary applies regardless of any longer provider/JWT expiry.
  const expiry = Math.min(nextDailyExpiry(now), ...(expiryClaims.length ? expiryClaims : [now + 10 * MINUTE]));
  return expiry - EXPIRY_MARGIN;
}

async function readBoundedJson(response: Response): Promise<unknown> {
  if (Number(response.headers.get('content-length')) > MAX_RESPONSE_BYTES || !response.body) throw new Error('invalid response');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error('invalid response');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function fail(state: CredentialState, reason: string): GrowwAccess {
  state.token = null;
  state.expiresAt = 0;
  state.failureUntil = Date.now() + MINUTE;
  state.failureReason = reason;
  return unavailable(reason);
}

async function authenticate(state: CredentialState, apiKey: string, apiSecret: string): Promise<GrowwAccess> {
  const now = Date.now();
  authenticationRequests = authenticationRequests.filter((time) => time > now - DAY);
  if (authenticationRequests.length >= 100) {
    return fail(state, 'Groww authentication request budget reached. Try again after the daily request window clears.');
  }
  authenticationRequests.push(now);
  const timestamp = Math.floor(now / 1_000).toString();
  const checksum = createHash('sha256').update(apiSecret + timestamp).digest('hex');
  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-VERSION': '1.0',
      },
      body: JSON.stringify({ key_type: 'approval', checksum, timestamp }),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(7_000),
    });
    if (response.status === 429 || response.status >= 500) return fail(state, AUTH_UNAVAILABLE);
    if (!response.ok) return fail(state, AUTH_FAILURE);
    const payload = record(await readBoundedJson(response));
    const token = payload?.token;
    if (!payload || typeof token !== 'string' || !token || !validCredential(token) || payload.isActive === false) return fail(state, AUTH_FAILURE);
    const expiresAt = usableUntil(payload, token, Date.now());
    if (expiresAt <= Date.now()) return fail(state, AUTH_FAILURE);
    state.token = token;
    state.expiresAt = expiresAt;
    state.failureUntil = 0;
    state.failureReason = null;
    return { token, reason: null };
  } catch {
    // Never surface a provider body, thrown message, credential or checksum.
    return fail(state, AUTH_UNAVAILABLE);
  }
}

export async function getGrowwAccess(): Promise<GrowwAccess> {
  const direct = process.env.GROWW_ACCESS_TOKEN?.trim();
  if (direct) {
    if (!validCredential(direct)) {
      active = null;
      return unavailable('Groww access token is invalid. Reconnect the market-data account.');
    }
    const state = stateFor(fingerprint(['direct', direct]), false);
    // A manually supplied token remains authoritative. Never fall through to
    // key/secret authentication when this override is rejected.
    state.token = direct;
    state.expiresAt = Infinity;
    return { token: direct, reason: null };
  }
  const apiKey = process.env.GROWW_API_KEY?.trim();
  const apiSecret = process.env.GROWW_API_SECRET?.trim();
  if (!apiKey || !apiSecret) {
    active = null;
    return unavailable(apiKey || apiSecret
      ? 'Groww credentials are incomplete. Reconnect the market-data account.'
      : 'Groww is not connected. Indian quotes are unavailable.');
  }
  if (!validCredential(apiKey) || !validCredential(apiSecret)) {
    active = null;
    return unavailable('Groww credentials are invalid. Reconnect the market-data account.');
  }
  const state = stateFor(fingerprint(['approval', apiKey, apiSecret]), true);
  const now = Date.now();
  if (state.failureUntil > now) return unavailable(state.failureReason ?? AUTH_FAILURE);
  if (state.token && state.expiresAt > now) return { token: state.token, reason: null };
  if (state.pending) return state.pending;
  const task = authenticate(state, apiKey, apiSecret);
  state.pending = task;
  try { return await task; }
  finally { if (state.pending === task) state.pending = null; }
}

export function invalidateGrowwAccess(token: string): void {
  // Late rejections for an older token must not clear a rotated credential or
  // generate another token immediately during a burst of market-data requests.
  if (active?.generated && active.token === token) fail(active, REJECTED_ACCESS);
}
