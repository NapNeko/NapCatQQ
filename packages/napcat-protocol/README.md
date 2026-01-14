# NapCat Protocol Manager

统一管理 NapCat 的多协议适配器（OneBot 和 Satori）。

## 特性

- 🔌 **统一接口**: 提供统一的协议管理接口
- 🎯 **插件化设计**: 支持动态注册和管理协议适配器
- 🔄 **热重载**: 支持协议配置的热重载
- 📦 **开箱即用**: 内置 OneBot11 和 Satori 协议支持

## 架构

```
napcat-protocol
├── types.ts              # 协议接口定义
├── manager.ts            # 协议管理器
├── adapters/
│   ├── onebot.ts        # OneBot11 协议适配器包装
│   └── satori.ts        # Satori 协议适配器包装
└── index.ts             # 导出入口
```

## 使用方法

### 基础使用

```typescript
import { ProtocolManager } from 'napcat-protocol';

// 创建协议管理器
const protocolManager = new ProtocolManager(core, context, pathWrapper);

// 初始化所有协议
await protocolManager.initAllProtocols();

// 获取协议适配器
const onebotAdapter = protocolManager.getOneBotAdapter();
const satoriAdapter = protocolManager.getSatoriAdapter();
```

### 单独初始化协议

```typescript
// 只初始化 OneBot11
await protocolManager.initProtocol('onebot11');

// 只初始化 Satori
await protocolManager.initProtocol('satori');
```

### 获取原始适配器

```typescript
// 获取 OneBot 原始适配器
const onebotAdapter = protocolManager.getOneBotAdapter();
if (onebotAdapter) {
  const rawOneBot = onebotAdapter.getRawAdapter();
  // 使用 NapCatOneBot11Adapter 的所有功能
}

// 获取 Satori 原始适配器
const satoriAdapter = protocolManager.getSatoriAdapter();
if (satoriAdapter) {
  const rawSatori = satoriAdapter.getRawAdapter();
  // 使用 NapCatSatoriAdapter 的所有功能
}
```

### 配置重载

```typescript
// 重载 OneBot 配置
await protocolManager.reloadProtocolConfig('onebot11', prevConfig, newConfig);

// 重载 Satori 配置
await protocolManager.reloadProtocolConfig('satori', prevConfig, newConfig);
```

### 查询协议状态

```typescript
// 获取所有已注册的协议信息
const protocols = protocolManager.getRegisteredProtocols();

// 检查协议是否已初始化
const isInitialized = protocolManager.isProtocolInitialized('onebot11');

// 获取所有已初始化的协议ID
const initializedIds = protocolManager.getInitializedProtocolIds();
```

### 销毁协议

```typescript
// 销毁指定协议
await protocolManager.destroyProtocol('onebot11');

// 销毁所有协议
await protocolManager.destroyAllProtocols();
```

## 在 Framework 中使用

```typescript
// packages/napcat-framework/napcat.ts
import { ProtocolManager } from 'napcat-protocol';

const protocolManager = new ProtocolManager(core, context, pathWrapper);
await protocolManager.initAllProtocols();

// 注册到 WebUI
const onebotAdapter = protocolManager.getOneBotAdapter();
if (onebotAdapter) {
  WebUiDataRuntime.setOneBotContext(onebotAdapter.getRawAdapter());
}

const satoriAdapter = protocolManager.getSatoriAdapter();
if (satoriAdapter) {
  WebUiDataRuntime.setSatoriContext(satoriAdapter.getRawAdapter());
}
```

## 在 Shell 中使用

```typescript
// packages/napcat-shell/base.ts
import { ProtocolManager } from 'napcat-protocol';

export class NapCatShell {
  public protocolManager?: ProtocolManager;

  async InitNapCat() {
    await this.core.initCore();
    
    this.protocolManager = new ProtocolManager(
      this.core, 
      this.context, 
      this.context.pathWrapper
    );
    
    await this.protocolManager.initAllProtocols();
  }
}
```

## 扩展自定义协议

如果需要添加新的协议支持，可以实现 `IProtocolAdapter` 和 `IProtocolAdapterFactory` 接口：

```typescript
import { IProtocolAdapter, IProtocolAdapterFactory } from 'napcat-protocol';

// 实现协议适配器
class MyProtocolAdapter implements IProtocolAdapter {
  readonly name = 'MyProtocol';
  readonly id = 'myprotocol';
  readonly version = '1.0.0';
  readonly description = '我的自定义协议';

  async init(): Promise<void> {
    // 初始化逻辑
  }

  async destroy(): Promise<void> {
    // 清理逻辑
  }

  async reloadConfig(prevConfig: unknown, newConfig: unknown): Promise<void> {
    // 配置重载逻辑
  }
}

// 实现工厂
class MyProtocolAdapterFactory implements IProtocolAdapterFactory {
  readonly protocolId = 'myprotocol';
  readonly protocolName = 'MyProtocol';
  readonly protocolVersion = '1.0.0';
  readonly protocolDescription = '我的自定义协议';

  create(core, context, pathWrapper) {
    return new MyProtocolAdapter(core, context, pathWrapper);
  }
}

// 注册到管理器
protocolManager.registerFactory(new MyProtocolAdapterFactory());
await protocolManager.initProtocol('myprotocol');
```

## API 文档

### ProtocolManager

#### 方法

- `registerFactory(factory: IProtocolAdapterFactory)`: 注册协议工厂
- `getRegisteredProtocols()`: 获取所有已注册的协议信息
- `initProtocol(protocolId: string)`: 初始化指定协议
- `initAllProtocols()`: 初始化所有协议
- `destroyProtocol(protocolId: string)`: 销毁指定协议
- `destroyAllProtocols()`: 销毁所有协议
- `getAdapter<T>(protocolId: string)`: 获取协议适配器
- `getOneBotAdapter()`: 获取 OneBot 协议适配器
- `getSatoriAdapter()`: 获取 Satori 协议适配器
- `reloadProtocolConfig(protocolId, prevConfig, newConfig)`: 重载协议配置
- `isProtocolInitialized(protocolId: string)`: 检查协议是否已初始化
- `getInitializedProtocolIds()`: 获取所有已初始化的协议ID

### IProtocolAdapter

协议适配器接口，所有协议适配器都需要实现此接口。

#### 属性

- `name: string`: 协议名称
- `id: string`: 协议ID
- `version: string`: 协议版本
- `description: string`: 协议描述

#### 方法

- `init()`: 初始化协议适配器
- `destroy()`: 销毁协议适配器
- `reloadConfig(prevConfig, newConfig)`: 重载配置

### IProtocolAdapterFactory

协议适配器工厂接口，用于创建协议适配器实例。

#### 属性

- `protocolId: string`: 协议ID
- `protocolName: string`: 协议名称
- `protocolVersion: string`: 协议版本
- `protocolDescription: string`: 协议描述

#### 方法

- `create(core, context, pathWrapper)`: 创建协议适配器实例

## 依赖

- `napcat-core`: NapCat 核心
- `napcat-common`: NapCat 通用工具
- `napcat-onebot`: OneBot11 协议实现
- `napcat-satori`: Satori 协议实现

## 许可证

与 NapCat 主项目保持一致
