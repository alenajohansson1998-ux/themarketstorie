# Groww Indian market data

The Market Impact Radar uses Groww's official Trading API for token generation and read-only data for six NSE CASH instruments: Nifty 50, Nifty Bank, Reliance Industries, TCS, Infosys and HDFC Bank. Stock prices and historical stock closes are in INR; Nifty 50 and Nifty Bank index levels are in points. No orders are placed or account portfolios accessed.

## Configuration

Add the API key and secret to the server's environment, then restart the development server:

```dotenv
GROWW_API_KEY=your_groww_api_key
GROWW_API_SECRET=your_groww_api_secret
# Optional manual-token override; leave empty when using key + secret.
GROWW_ACCESS_TOKEN=
```

Generate the key and secret from Groww's [Trading API Keys page](https://groww.in/trade-api/api-keys). A Groww account and active Trading API subscription are required. Approve the key on that page daily, as required by the [official authentication documentation](https://groww.in/trade-api/docs/curl). The server then generates and caches an access token with Groww's approval flow; it does not bypass daily approval. No token is written to `.env` or sent to the browser.

The auth request is `POST https://api.groww.in/v1/token/api/access`. The API key is sent in the bearer header. The JSON body contains `key_type: "approval"`, the current epoch-seconds `timestamp` as a string, and `checksum: SHA256(api_secret + timestamp)`. The raw secret is never sent in the body. A nonempty `GROWW_ACCESS_TOKEN` takes precedence as a manual override; it must be renewed manually and is never silently replaced using the key pair.

Generated tokens are cached only until a conservative expiry: the earliest valid explicit-zone provider expiry, JWT expiry, or next 6:00 AM IST boundary, with a renewal margin. If no usable expiry is supplied, the cache lasts at most 10 minutes. Concurrent auth calls coalesce, credential changes invalidate the auth cache, and failures or rejected generated tokens have a 60-second cooldown. Authentication is capped at 100 attempts per rolling 24 hours per worker, below the provider's 150-request daily cap. A deployment with multiple workers needs a shared authentication budget/cache.

All three credentials are server-only: never use a `NEXT_PUBLIC_` prefix, put them in browser requests or paste them into URLs. Market-data requests carry the access token only in the `Authorization` header. Failure messages returned to the browser contain static explanations rather than raw upstream bodies, exceptions or credentials. Private credential fingerprints isolate caches after rotation.

With no complete credentials the page shows unavailable Indian quotes and makes no Groww requests. Rejected, unapproved, expired, rate-limited or malformed responses stay unavailable. No Yahoo, generated curve or stale successful quote is substituted as a Groww quote.

## Provider contracts

- [Quote reference](https://groww.in/trade-api/docs/curl/live-data): `GET https://api.groww.in/v1/live-data/quote`, with `exchange=NSE`, `segment=CASH` and the exchange trading symbol such as `RELIANCE`. Requests include `Accept: application/json`, `X-API-VERSION: 1.0` and a bearer access token. A quote requires both a positive numeric `payload.last_price` and `payload.last_trade_time` in documented epoch **milliseconds**. `day_change` and `day_change_perc` are preserved as provider values; missing values stay null. The bulk LTP endpoint is not used because its documented response has no trade timestamp.
- [Current historical reference](https://groww.in/trade-api/docs/curl/backtesting): `GET https://api.groww.in/v1/historical/candles`, with `exchange=NSE`, `segment=CASH`, `groww_symbol=NSE-RELIANCE`, `start_time` and `end_time` in epoch **seconds**, and `candle_interval=1hour` or `1day`. Candle rows contain timestamp, open, high, low, close, volume and optional open interest. The close remains aligned with its own timestamp. The old `/v1/historical/candle/range` endpoint is deprecated and is not used.
- [Instrument reference](https://groww.in/trade-api/docs/curl/instruments): official identifiers can be verified against Groww's instrument CSV. Quote `trading_symbol` is `RELIANCE`, while the current historical `groww_symbol` is `NSE-RELIANCE`. Public application IDs use `NSE:RELIANCE`; these three formats are not interchangeable.

## Caching and bounds

Quotes are cached in each server worker for 60 seconds, historical responses for 5 minutes and request failures for 15 seconds. Concurrent identical requests coalesce. Refreshing the page is not a streaming feed, and the displayed last-trade timestamp can be older when the market is closed or an instrument has not traded.

Each worker spaces request starts by at least 180 ms and caps combined quote/history requests at 40 per minute, with at most 20 outstanding requests and 64 cache entries. All provider requests have a 7-second timeout, a 1 MB response cap and disallow redirects. These limits are deliberately below the [documented shared Live Data allowance](https://groww.in/trade-api/docs/curl) of 10 requests per second and 300 per minute. Groww's current rate-limit table does not separately specify a history allowance; the conservative local cap applies to history too. A deployment with multiple workers should coordinate budgets in shared storage to respect any account-wide limits.

History requests accept only the six configured symbols and verified, explicit-timezone event times from the past 365 days. Recent event windows use hourly bars; older events use daily bars. Context requests cover 30 days. Event-comparison windows are at most 11 days, below the provider's documented 180-day hourly/daily maximum.

## Timestamp limitations

Groww's current historical examples return wall-clock strings such as `2025-09-24T10:30:00` without a timezone. Its REST reference does not explicitly establish their timezone or candle boundary semantics. The adapter interprets zoneless timestamps as **Asia/Kolkata (UTC+05:30)** for historical chart context and labels this as an assumption. It never delegates this parsing to the deployment machine's local timezone.

If an event-time comparison is requested and returned candles require this assumption, the series is unavailable for that comparison. Explicit-offset or epoch-second candle times can be compared using the existing conservative completed-bar rule: treat timestamps as interval starts and add one whole interval. A straddling bar cannot become the pre-event baseline. This is a conservative convention, not a verified Groww candle-boundary guarantee. Missing and incomplete samples are not filled or interpolated. Article publication time is never substituted for an unknown occurrence time.

## Display permission

An API subscription does not by itself establish permission to redistribute exchange data publicly. [Groww's general terms](https://groww.in/pages/terms-and-conditions-groww), section III.2, restrict redistribution/public display of platform content beyond permitted use; section XI describes personal/family algorithmic trading use. Public dashboard display and commercial exchange-data redistribution rights were not established by the API reference. Confirm the appropriate Groww/exchange permissions before public rollout. This work configures the existing local dashboard and does not publish it.

## Files and checks

- `lib/market-impact/indian-instruments.ts`: browser-safe public instrument IDs and names.
- `lib/market-impact/groww.ts`: server-only provider adapter, normalization, caching and request bounds.
- `lib/market-impact/groww-auth.ts`: server-side approval flow, credential selection, token lifecycle and auth request limits.
- `tests/groww-market-data.test.mjs`: contract, timestamp, missing-token, caching, credential handling, failure and request-bound checks.
- `tests/groww-auth.test.mjs`: checksum, coalescing, expiry, credential rotation, rejection, request bounds and secret handling.

```powershell
node --experimental-strip-types --test tests/groww-market-data.test.mjs tests/groww-auth.test.mjs
```

Live authenticated data can only be checked after a valid subscribed Groww key pair is configured and approved, or a current manual access token is provided. The focused automated tests use controlled provider responses and never trade or make authenticated provider calls.
