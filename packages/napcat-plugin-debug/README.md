# napcat-plugin-debug

NapCat 插件调试服务 — 通过 WebSocket 暴露插件管理 API，配合 CLI 实现热重载 (HMR)。

## 架构

```
NapCat 主进程
  └─ napcat-plugin-debug (NapCat 插件)
      └─ WebSocket Server (端口可配置，默认 8998)
          └─ napcat-rpc 代理 IPluginManager
              └─ CLI 客户端连接
                  └─ 文件监听 + 热重载
```

**核心思想**：不侵入 NapCat 核心代码，所有调试功能以插件形式提供。

- **插件侧**（`index.ts`）：启动 WebSocket 服务器，通过 `napcat-rpc` 将 `IPluginManager` 的所有 API 暴露给远程客户端
- **CLI 侧**（`cli/index.ts`）：连接 WebSocket，通过 RPC 代理调用远程 API，监听文件变更自动触发 `reloadPlugin`

## 快速开始

### 1. 安装插件

将 `napcat-plugin-debug` 安装到 NapCat 的插件目录，启用后会自动启动调试服务。

### 2. 连接 CLI

```bash
# 默认连接 ws://127.0.0.1:8998
npx napcat-plugin-debug

# 指定地址
npx napcat-plugin-debug ws://192.168.1.100:8998

# 带认证
npx napcat-plugin-debug --token mySecretToken

# 直接监听某个插件目录（自动热重载）
npx napcat-plugin-debug --watch ./my-plugin

# 监听远程插件目录的所有插件
npx napcat-plugin-debug --watch-all
```

### 3. 交互命令

连接成功后进入交互模式：

| 命令 | 说明 |
|------|------|
| `list` / `ls` | 列出所有插件 |
| `reload <id>` | 重载指定插件 |
| `load <id>` | 加载指定插件 |
| `unload <id>` | 卸载指定插件 |
| `info <id>` | 查看插件详情 |
| `watch <dir>` | 开始监听目录 |
| `unwatch` | 停止文件监听 |
| `status` | 查看调试服务状态 |
| `ping` | 心跳检查 |
| `quit` | 退出 |

## 热重载 (HMR) 原理

1. CLI 使用 `fs.watch` 递归监听插件目录
2. 检测到 `.ts/.js/.mjs/.cjs/.json` 文件变更后触发防抖（500ms）
3. 通过 WebSocket RPC 调用远程 `reloadPlugin(pluginId)`
4. NapCat 的 PluginManager 执行：卸载旧插件 → 清除缓存 → 重新加载

## 配置

通过 WebUI 配置或直接编辑插件配置文件：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `port` | `8998` | WebSocket 监听端口 |
| `host` | `127.0.0.1` | 监听地址 |
| `enableAuth` | `false` | 是否启用认证 |
| `authToken` | `""` | 认证 token |

## 安全提示

- 默认仅监听 `127.0.0.1`，不会暴露到公网
- 如需远程访问，强烈建议启用 `enableAuth` 并设置强密码
- 调试服务提供完整的插件管理能力，请勿在生产环境暴露
