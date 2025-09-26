const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
export const BASE62 = LOWER + UPPER + DIGITS;

export function base62Encode(num: number): string {
  if (num === 0) return BASE62[0];
  let s = '';
  let n = Math.floor(num);
  while (n > 0) {
    const r = n % 62;
    s = BASE62[r] + s;
    n = Math.floor(n / 62);
  }
  return s;
}

export function base62EncodeBigInt(num: bigint): string {
  if (num === 0n) return BASE62[0];
  let s = '';
  let n = num;
  const sixtyTwo = 62n;
  while (n > 0n) {
    const r = Number(n % sixtyTwo);
    s = BASE62[r] + s;
    n = n / sixtyTwo;
  }
  return s;
}
