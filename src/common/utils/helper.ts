import crypto from 'node:crypto';

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getMd5(s: string) {

  const h = crypto.createHash('md5');
  h.update(s);
  return h.digest('hex');
}

export function isNull(value: any) {
  return value === undefined || value === null;
}

export function isNumeric(str: string) {
  return /^\d+$/.test(str);
}
