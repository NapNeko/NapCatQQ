import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'fs/promises';
import { log, logDebug } from './log';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fsPromise from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
export function simpleDecorator(target: any, context: any) {
}

// export function CacheClassFunc(ttl: number = 3600 * 1000, customKey: string = '') {
//   const cache = new Map<string, { expiry: number; value: any }>();
//   return function CacheClassFuncDecorator(originalMethod: Function, context: ClassMethodDecoratorContext) {
//     async function CacheClassFuncDecoratorInternal(this: any, ...args: any[]) {
//       const key = `${customKey}${String(context.name)}.(${args.map(arg => JSON.stringify(arg)).join(', ')})`;
//       const cachedValue = cache.get(key);
//       if (cachedValue && cachedValue.expiry > Date.now()) {
//         return cachedValue.value;
//       }
//       const result = originalMethod.call(this, ...args);
//       cache.set(key, { expiry: Date.now() + ttl, value: result });
//       return result;
//     }
//     return CacheClassFuncDecoratorInternal;
//   }
// }
export function CacheClassFuncAsync(ttl: number = 3600 * 1000, customKey: string = '') {
  //console.log('CacheClassFuncAsync', ttl, customKey);
  function logExecutionTime(target: any, methodName: string, descriptor: PropertyDescriptor) {
    //console.log('logExecutionTime', target, methodName, descriptor);
    const cache = new Map<string, { expiry: number; value: any }>();
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const key = `${customKey}${String(methodName)}.(${args.map(arg => JSON.stringify(arg)).join(', ')})`;
      cache.forEach((value, key) => {
        if (value.expiry < Date.now()) {
          cache.delete(key);
        }
      });
      const cachedValue = cache.get(key);
      if (cachedValue && cachedValue.expiry > Date.now()) {
        return cachedValue.value;
      }
      // const start = Date.now();
      const result = await originalMethod.apply(this, args);
      // const end = Date.now();
      // console.log(`Method ${methodName} executed in ${end - start} ms.`);
      cache.set(key, { expiry: Date.now() + ttl, value: result });
      return result;
    };
  }
  return logExecutionTime;
}
export function CacheClassFuncAsyncExtend(ttl: number = 3600 * 1000, customKey: string = '', checker: any = (...data: any[]) => { return true; }) {
  //console.log('CacheClassFuncAsync', ttl, customKey);
  function logExecutionTime(target: any, methodName: string, descriptor: PropertyDescriptor) {
    //console.log('logExecutionTime', target, methodName, descriptor);
    const cache = new Map<string, { expiry: number; value: any }>();
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const key = `${customKey}${String(methodName)}.(${args.map(arg => JSON.stringify(arg)).join(', ')})`;
      cache.forEach((value, key) => {
        if (value.expiry < Date.now()) {
          cache.delete(key);
        }
      });
      const cachedValue = cache.get(key);
      if (cachedValue && cachedValue.expiry > Date.now()) {
        return cachedValue.value;
      }
      // const start = Date.now();
      const result = await originalMethod.apply(this, args);
      if (!checker(...args, result)) {
        return result;//丢弃缓存
      }
      // const end = Date.now();
      // console.log(`Method ${methodName} executed in ${end - start} ms.`);
      cache.set(key, { expiry: Date.now() + ttl, value: result });
      return result;
    };
  }
  return logExecutionTime;
}
// export function CacheClassFuncAsync(ttl: number = 3600 * 1000, customKey: string = ''): any {
//   const cache = new Map<string, { expiry: number; value: any }>();

//   // 注意：在JavaScript装饰器中，我们通常不直接处理ClassMethodDecoratorContext这样的类型，
//   // 因为装饰器的参数通常是目标类（对于类装饰器）、属性名（对于属性装饰器）等。
//   // 对于方法装饰器，我们关注的是方法本身及其描述符。
//   // 但这里我们维持原逻辑，假设有一个自定义的处理上下文的方式。

//   return function (originalMethod: Function): any {
//     console.log(originalMethod);
//     // 由于JavaScript装饰器原生不支持异步直接定义，我们保持async定义以便处理异步方法。
//     async function decoratorWrapper(this: any, ...args: any[]): Promise<any> {
//       console.log(...args);
//       const key = `${customKey}${originalMethod.name}.(${args.map(arg => JSON.stringify(arg)).join(', ')})`;
//       const cachedValue = cache.get(key);
//       // 遍历cache 清除expiry内容
//       cache.forEach((value, key) => {
//         if (value.expiry < Date.now()) {
//           cache.delete(key);
//         }
//       });
//       if (cachedValue && cachedValue.expiry > Date.now()) {
//         return cachedValue.value;
//       }

//       // 直接await异步方法的结果
//       const result = await originalMethod.apply(this, args);
//       cache.set(key, { expiry: Date.now() + ttl, value: result });
//       return result;
//     }

//     // 返回装饰后的方法，保持与原方法相同的名称和描述符（如果需要更精细的控制，可以考虑使用Object.getOwnPropertyDescriptor等）
//     return decoratorWrapper;
//   };
// }

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
    GroupLocalTime: {
      Record: false,
      RecordList: []
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
// 升级旧的配置到新的
export async function UpdateConfig() {
  const configFiles = await fs.readdir(path.join(__dirname, 'config'));
  for (const file of configFiles) {
    if (file.match(/^onebot11_\d+.json$/)) {
      const CurrentConfig = JSON.parse(await fs.readFile(path.join(__dirname, 'config', file), 'utf8'));
      if (isValidOldConfig(CurrentConfig)) {
        log('正在迁移旧配置到新配置 File:', file);
        const NewConfig = migrateConfig(CurrentConfig);
        await fs.writeFile(path.join(__dirname, 'config', file), JSON.stringify(NewConfig, null, 2));
      }
    }
  }
}
export function isEqual(obj1: any, obj2: any) {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!isEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}

export async function deleteOldFiles(directoryPath: string, daysThreshold: number) {
  try {
    const files = await fsPromise.readdir(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fsPromise.stat(filePath);
      const lastModifiedTime = stats.mtimeMs;
      const currentTime = Date.now();
      const timeDifference = currentTime - lastModifiedTime;
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

      if (daysDifference > daysThreshold) {
        await fsPromise.unlink(filePath); // Delete the file
        //console.log(`Deleted: ${filePath}`);
      }
    }
  } catch (error) {
    //console.error('Error deleting files:', error);
  }
}
