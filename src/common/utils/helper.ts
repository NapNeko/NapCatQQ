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



/**
 * 函数缓存装饰器，根据方法名、参数、自定义key生成缓存键，在一定时间内返回缓存结果
 * @param ttl 超时时间，单位毫秒
 * @param customKey 自定义缓存键前缀，可为空，防止方法名参数名一致时导致缓存键冲突
 * @returns 处理后缓存或调用原方法的结果
 */
export function cacheFunc(ttl: number, customKey: string='') {
  const cache = new Map<string, { expiry: number; value: any }>();

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;  // 获取类名
    const methodName = propertyKey;             // 获取方法名
    descriptor.value = async function (...args: any[]){
      const cacheKey = `${customKey}${className}.${methodName}:${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      } else {
        const result = await originalMethod.apply(this, args);
        cache.set(cacheKey, { value: result, expiry: Date.now() + ttl });
        return result;
      }
    };

    return descriptor;
  };
}
