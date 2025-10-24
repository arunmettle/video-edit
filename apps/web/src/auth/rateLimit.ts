// Tiny in-memory token bucket per IP+route
// For demo purposes only; replace with a shared store in prod.
type Key = string;
type Bucket = { tokens: number; last: number };
const MAX = 10; // tokens
const REFILL_MS = 60_000; // per minute
const buckets = new Map<Key, Bucket>();

export function allow(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: MAX, last: now };
  // refill
  const elapsed = now - b.last;
  const refill = Math.floor(elapsed / REFILL_MS) * MAX;
  b.tokens = Math.min(MAX, b.tokens + (refill > 0 ? refill : 0));
  b.last = now;
  if (b.tokens <= 0) {
    buckets.set(key, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return true;
}

