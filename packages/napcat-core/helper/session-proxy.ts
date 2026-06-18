import { NodeIQQNTWrapperSession } from '@/napcat-core/wrapper';
import { ServiceNamingMapping } from '@/napcat-core/services/index';
import { NTEventWrapper } from './event';

/**
 * 创建 Service 方法的代理
 * 拦截所有方法调用，通过 EventWrapper 进行调用
 */
function createServiceMethodProxy<S extends keyof ServiceNamingMapping> (
  serviceName: S,
  originalService: ServiceNamingMapping[S],
  eventWrapper: NTEventWrapper
): ServiceNamingMapping[S] {
  return new Proxy(originalService as object, {
    get (target, prop, receiver) {
      const originalValue = Reflect.get(target, prop, receiver);

      // 如果不是函数，直接返回原始值
      if (typeof originalValue !== 'function') {
        return originalValue;
      }

      const methodName = prop as string;

      // 返回一个包装函数，通过 EventWrapper 调用
      return function (this: unknown, ...args: unknown[]) {
        // 构造 EventWrapper 需要的路径格式: ServiceName/MethodName
        const eventPath = `${serviceName}/${methodName}`;

        // 尝试通过 EventWrapper 调用
        try {
          // 使用 callNoListenerEvent 的底层实现逻辑
          const eventFunc = (eventWrapper as any).createEventFunction(eventPath);
          if (eventFunc) {
            return eventFunc(...args);
          }
        } catch {
          // 如果 EventWrapper 调用失败，回退到原始调用
        }

        // 回退到原始方法调用
        return originalValue.apply(originalService, args);
      };
    },
  }) as ServiceNamingMapping[S];
}

/**
 * 创建 Session 的双层代理
 * 第一层：拦截 getXXXService 方法
 * 第二层：拦截 Service 上的具体方法调用
 */
export function createSessionProxy (
  session: NodeIQQNTWrapperSession,
  eventWrapper: NTEventWrapper
): NodeIQQNTWrapperSession {
  // 缓存已代理的 Service，避免重复创建
  const serviceProxyCache = new Map<string, unknown>();

  return new Proxy(session, {
    get (target, prop, receiver) {
      const propName = prop as string;

      // 检查是否是 getXXXService 方法
      if (typeof propName === 'string' && propName.startsWith('get') && propName.endsWith('Service')) {
        // 提取 Service 名称: getMsgService -> NodeIKernelMsgService
        const servicePart = propName.slice(3); // 移除 'get' 前缀
        const serviceName = `NodeIKernel${servicePart}` as keyof ServiceNamingMapping;

        // 返回一个函数，该函数返回代理后的 Service
        return function () {
          // 检查缓存
          if (serviceProxyCache.has(serviceName)) {
            return serviceProxyCache.get(serviceName);
          }

          // 获取原始 Service
          const originalGetter = Reflect.get(target, prop, receiver) as () => unknown;
          const originalService = originalGetter.call(target);

          // 检查是否在 ServiceNamingMapping 中定义
          if (isKnownService(serviceName)) {
            // 创建 Service 方法代理
            const proxiedService = createServiceMethodProxy(
              serviceName,
              originalService as ServiceNamingMapping[typeof serviceName],
              eventWrapper
            );
            serviceProxyCache.set(serviceName, proxiedService);
            return proxiedService;
          }

          // 未知的 Service，直接返回原始对象
          serviceProxyCache.set(serviceName, originalService);
          return originalService;
        };
      }

      // 非 getXXXService 方法，直接返回原始值
      return Reflect.get(target, prop, receiver);
    },
  });
}

/**
 * 检查 Service 名称是否在已知的映射中
 */
function isKnownService (serviceName: string): serviceName is keyof ServiceNamingMapping {
  const knownServices: string[] = [
    'NodeIKernelAvatarService',
    'NodeIKernelBuddyService',
    'NodeIKernelFileAssistantService',
    'NodeIKernelGroupService',
    'NodeIKernelLoginService',
    'NodeIKernelMsgService',
    'NodeIKernelOnlineStatusService',
    'NodeIKernelProfileLikeService',
    'NodeIKernelProfileService',
    'NodeIKernelTicketService',
    'NodeIKernelStorageCleanService',
    'NodeIKernelRobotService',
    'NodeIKernelRichMediaService',
    'NodeIKernelDbToolsService',
    'NodeIKernelTipOffService',
    'NodeIKernelSearchService',
    'NodeIKernelCollectionService',
  ];
  return knownServices.includes(serviceName);
}

/**
 * 创建带有 EventWrapper 集成的 InstanceContext
 * 这是推荐的使用方式，在创建 context 时自动代理 session
 */
export function createProxiedSession (
  session: NodeIQQNTWrapperSession,
  eventWrapper: NTEventWrapper
): NodeIQQNTWrapperSession {
  return createSessionProxy(session, eventWrapper);
}
