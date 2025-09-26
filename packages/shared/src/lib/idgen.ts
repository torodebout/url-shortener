import { base62EncodeBigInt } from './base62.js';

const PREFIX = (process.env.MACHINE_PREFIX || 'a').slice(0, 1);
let seq = 0n;

export function nextId(): string {
  const now = BigInt(Date.now()); // ms
  seq = (seq + 1n) % 1000000n;
  const composite = now * 1000000n + seq;
  const core = base62EncodeBigInt(composite);
  const trimmed = core.length >= 5 ? core.slice(0, 5) : core.padStart(5, 'a');
  return PREFIX + trimmed;
}
