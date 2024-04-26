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

export function truncateString(obj: any, maxLength = 500) {
  if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        // 如果是字符串且超过指定长度，则截断
        if (obj[key].length > maxLength) {
          obj[key] = obj[key].substring(0, maxLength) + '...';
        }
      } else if (typeof obj[key] === 'object') {
        // 如果是对象或数组，则递归调用
        truncateString(obj[key], maxLength);
      }
    });
  }
  return obj;
}
