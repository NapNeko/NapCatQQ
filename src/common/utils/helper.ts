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
export function cacheFunc(ttl: number, customKey: string = '') {
  const cache = new Map<string, { expiry: number; value: any }>();

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;  // 获取类名
    const methodName = propertyKey;             // 获取方法名
    descriptor.value = async function (...args: any[]) {
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
export function isValidOldConfig(config: any) {
  if (typeof config !== 'object') {
    return false;
  }
  const requiredKeys = [
    'httpHost', 'httpPort', 'httpPostUrls', 'httpSecret',
    'wsHost', 'wsPort', 'wsReverseUrls', 'enableHttp',
    'enableHttpHeart', 'enableHttpPost', 'enableWs', 'enableWsReverse',
    'messagePostFormat', 'reportSelfMessage', 'enableLocalFile2Url',
    'debug', 'heartInterval', 'token', 'musicSignUrl'
  ];
  for (const key of requiredKeys) {
    if (!(key in config)) {
      return false;
    }
  }
  if (!Array.isArray(config.httpPostUrls) || !Array.isArray(config.wsReverseUrls)) {
    return false;
  }
  if (config.httpPostUrls.some((url: any) => typeof url !== 'string')) {
    return false;
  }
  if (config.wsReverseUrls.some((url: any) => typeof url !== 'string')) {
    return false;
  }
  if (typeof config.httpPort !== 'number' || typeof config.wsPort !== 'number' || typeof config.heartInterval !== 'number') {
    return false;
  }
  if (
    typeof config.enableHttp !== 'boolean' ||
    typeof config.enableHttpHeart !== 'boolean' ||
    typeof config.enableHttpPost !== 'boolean' ||
    typeof config.enableWs !== 'boolean' ||
    typeof config.enableWsReverse !== 'boolean' ||
    typeof config.enableLocalFile2Url !== 'boolean' ||
    typeof config.reportSelfMessage !== 'boolean'
  ) {
    return false;
  }
  if (config.messagePostFormat !== 'array' && config.messagePostFormat !== 'string') {
    return false;
  }
  return true;
}
export function migrateConfig(oldConfig: any) {
  const newConfig = {
    http: {
      enable: oldConfig.enableHttp,
      host: oldConfig.httpHost,
      port: oldConfig.httpPort,
      secret: oldConfig.httpSecret,
      enableHeart: oldConfig.enableHttpHeart,
      enablePost: oldConfig.enableHttpPost,
      postUrls: oldConfig.httpPostUrls,
    },
    ws: {
      enable: oldConfig.enableWs,
      host: oldConfig.wsHost,
      port: oldConfig.wsPort,
    },
    reverseWs: {
      enable: oldConfig.enableWsReverse,
      urls: oldConfig.wsReverseUrls,
    },
    debug: oldConfig.debug,
    heartInterval: oldConfig.heartInterval,
    messagePostFormat: oldConfig.messagePostFormat,
    enableLocalFile2Url: oldConfig.enableLocalFile2Url,
    musicSignUrl: oldConfig.musicSignUrl,
    reportSelfMessage: oldConfig.reportSelfMessage,
    token: oldConfig.token,
  };
  return newConfig;
}