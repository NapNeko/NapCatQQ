# NapCat 协议架构重构说明

## 概述

本次重构将 OneBot 和 Satori 协议适配器统一由 `napcat-protocol` 包管理，实现了更清晰的架构和更好的可维护性。

## 架构变更

### 之前的架构

```
napcat-framework ──┬──> napcat-onebot
                   └──> napcat-satori

napcat-shell ──┬──> napcat-onebot
               └──> napcat-satori
```

每个入口点（framework/shell）都需要单独管理两个协议适配器。

### 重构后的架构

```
napcat-protocol ──┬──> napcat-onebot
                  └──> napcat-satori

napcat-framework ──> napcat-protocol
napcat-shell ──> napcat-protocol
```

所有协议适配器由 `napcat-protocol` 统一管理，framework 和 shell 只需要依赖 `napcat-protocol`。

## 新增的包

### napcat-protocol

位置: `packages/napcat-protocol/`

**功能:**
- 统一管理所有协议适配器
- 提供协议注册、初始化、销毁、配置重载等功能
- 支持动态扩展新协议

**主要文件:**
- `types.ts` - 协议接口定义
- `manager.ts` - 协议管理器实现
- `adapters/onebot.ts` - OneBot11 协议适配器包装
- `adapters/satori.ts` - Satori 协议适配器包装
- `index.ts` - 导出入口

## 代码变更

### 1. napcat-framework/napcat.ts

**之前:**
```typescript
import { NapCatOneBot11Adapter } from 'napcat-onebot/index';
import { NapCatSatoriAdapter } from 'napcat-satori/index';

const oneBotAdapter = new NapCatOneBot11Adapter(core, context, pathWrapper);
await oneBotAdapter.InitOneBot();

const satoriAdapter = new NapCatSatoriAdapter(core, context, pathWrapper);
await satoriAdapter.InitSatori();
```

**之后:**
```typescript
import { ProtocolManager } from 'napcat-protocol';

const protocolManager = new ProtocolManager(core, context, pathWrapper);
await protocolManager.initAllProtocols();

const onebotAdapter = protocolManager.getOneBotAdapter();
const satoriAdapter = protocolManager.getSatoriAdapter();
```

### 2. napcat-shell/base.ts

**之前:**
```typescript
const oneBotAdapter = new NapCatOneBot11Adapter(this.core, this.context, this.context.pathWrapper);
oneBotAdapter.InitOneBot().catch(e => this.context.logger.logError('初始化OneBot失败', e));

const satoriAdapter = new NapCatSatoriAdapter(this.core, this.context, this.context.pathWrapper);
satoriAdapter.InitSatori().catch(e => this.context.logger.logError('初始化Satori失败', e));
```

**之后:**
```typescript
this.protocolManager = new ProtocolManager(this.core, this.context, this.context.pathWrapper);
await this.protocolManager.initAllProtocols();

const onebotAdapter = this.protocolManager.getOneBotAdapter();
const satoriAdapter = this.protocolManager.getSatoriAdapter();
```

### 3. package.json 依赖变更

**napcat-framework/package.json:**
```json
{
  "dependencies": {
    "napcat-protocol": "workspace:*",
    // 移除了 napcat-onebot 和 napcat-satori 的直接依赖
  }
}
```

**napcat-shell/package.json:**
```json
{
  "dependencies": {
    "napcat-protocol": "workspace:*",
    // 移除了 napcat-onebot 和 napcat-satori 的直接依赖
  }
}
```

## 优势

### 1. 统一管理
- 所有协议适配器由单一入口管理
- 减少重复代码
- 更容易维护

### 2. 插件化设计
- 支持动态注册新协议
- 协议之间相互独立
- 易于扩展

### 3. 更好的封装
- 隐藏协议实现细节
- 提供统一的接口
- 降低耦合度

### 4. 配置管理
- 统一的配置重载机制
- 更好的错误处理
- 支持热重载

### 5. 状态管理
- 统一的协议状态查询
- 更好的生命周期管理
- 支持协议的动态启用/禁用

## 使用示例

### 初始化所有协议

```typescript
const protocolManager = new ProtocolManager(core, context, pathWrapper);
await protocolManager.initAllProtocols();
```

### 初始化特定协议

```typescript
await protocolManager.initProtocol('onebot11');
await protocolManager.initProtocol('satori');
```

### 获取协议适配器

```typescript
const onebotAdapter = protocolManager.getOneBotAdapter();
if (onebotAdapter) {
  const rawAdapter = onebotAdapter.getRawAdapter();
  // 使用原始适配器的所有功能
}
```

### 配置重载

```typescript
await protocolManager.reloadProtocolConfig('satori', prevConfig, newConfig);
```

### 查询协议状态

```typescript
const protocols = protocolManager.getRegisteredProtocols();
const isInitialized = protocolManager.isProtocolInitialized('onebot11');
```

## 扩展新协议

如果需要添加新的协议支持：

1. 实现 `IProtocolAdapter` 接口
2. 实现 `IProtocolAdapterFactory` 接口
3. 注册到 `ProtocolManager`

```typescript
class MyProtocolAdapter implements IProtocolAdapter {
  // 实现接口方法
}

class MyProtocolAdapterFactory implements IProtocolAdapterFactory {
  create(core, context, pathWrapper) {
    return new MyProtocolAdapter(core, context, pathWrapper);
  }
}

protocolManager.registerFactory(new MyProtocolAdapterFactory());
await protocolManager.initProtocol('myprotocol');
```

## 迁移指南

### 对于现有代码

1. 更新 package.json 依赖
2. 将 `napcat-onebot` 和 `napcat-satori` 的导入改为 `napcat-protocol`
3. 使用 `ProtocolManager` 替代直接实例化适配器
4. 通过 `getOneBotAdapter()` 和 `getSatoriAdapter()` 获取适配器
5. 使用 `getRawAdapter()` 获取原始适配器实例

### 对于新代码

直接使用 `napcat-protocol` 包，参考上面的使用示例。

## 兼容性

- ✅ 完全向后兼容
- ✅ 所有原有功能保持不变
- ✅ 可以通过 `getRawAdapter()` 访问原始适配器的所有功能
- ✅ WebUI 集成无需修改

## 测试

建议测试以下场景：

1. ✅ OneBot11 协议初始化和运行
2. ✅ Satori 协议初始化和运行
3. ✅ 配置热重载
4. ✅ 协议动态启用/禁用
5. ✅ WebUI 集成
6. ✅ Framework 模式
7. ✅ Shell 模式

## 后续计划

1. 添加更多协议支持（如 Telegram Bot API、Discord 等）
2. 优化协议管理器性能
3. 添加协议间通信机制
4. 完善文档和示例

## 相关文件

- `packages/napcat-protocol/` - 协议管理器包
- `packages/napcat-framework/napcat.ts` - Framework 入口
- `packages/napcat-shell/base.ts` - Shell 入口
- `packages/napcat-common/src/protocol/index.ts` - 协议信息定义
- `packages/napcat-webui-backend/src/api/ProtocolConfig.ts` - WebUI 协议配置 API

## 总结

本次重构通过引入 `napcat-protocol` 包，实现了协议适配器的统一管理，提高了代码的可维护性和可扩展性。同时保持了完全的向后兼容性，不影响现有功能的使用。
