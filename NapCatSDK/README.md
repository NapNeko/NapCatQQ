# NapCat Java SDK 使用文档

> 版本：1.0.0 · 适用于 NapCat JNI 插件桥接器
> 通信方式：子进程 + NDJSON / JSON-RPC 2.0
> 最低 JDK：11
> **Maven Central 坐标**：`io.github.cindifind:napcat-jni-sdk:1.0.0`
> **Central Portal Namespace**：`io.github.cindifind`

NapCat Java SDK 让你用 Java 编写 QQ 机器人插件，通过 OneBot 11 协议与 NapCat 主程序交互。本 SDK 封装了进程间通信、插件生命周期、Action 调用、日志、事件推送等能力，开发者只需实现 `NapCatPlugin` 接口即可。

---

## 目录

- [一、快速开始](#一快速开始)
- [二、Maven 依赖](#二maven-依赖)
- [三、插件清单文件](#三插件清单文件)
- [四、核心接口](#四核心接口)
  - [4.1 NapCatPlugin（插件接口）](#41-napcatplugin插件接口)
  - [4.2 NapCatPluginContext（插件上下文）](#42-napcatplugincontext插件上下文)
  - [4.3 Actions（OneBot Action 客户端）](#43-actionsonebot-action-客户端)
  - [4.4 PluginLogger（日志接口）](#44-pluginlogger日志接口)
  - [4.5 PluginLoader（插件加载器）](#45-pluginloader插件加载器)
- [五、进阶 API](#五进阶-api)
  - [5.1 NapCatBridge（桥接器核心）](#51-napcatbridge桥接器核心)
  - [5.2 ProtocolTypes（协议类型）](#52-protocoltypes协议类型)
- [六、完整示例](#六完整示例)
- [七、常见问题](#七常见问题)
- [附录 A：发布到 Maven Central Portal](#附录-a发布到-maven-central-portal)

---

## 一、快速开始

**1. 创建插件类**（实现 `NapCatPlugin` 接口，必须有无参构造）：

```java
package com.example;

import com.napcat.jni.plugin.*;
import java.util.Map;

public class HelloPlugin implements NapCatPlugin {
    private NapCatPluginContext ctx;

    @Override
    public void onInit(NapCatPluginContext ctx) {
        this.ctx = ctx;
        ctx.getLogger().info("Hello 插件已启动");
    }

    @Override
    public void onMessage(NapCatPluginContext ctx, Object messageEvent) throws Exception {
        Map<String, Object> msg = PluginLoader.eventToMap(messageEvent);
        String text = String.valueOf(msg.get("raw_message"));
        if (text.equals("你好")) {
            String msgType = String.valueOf(msg.get("message_type"));
            String peer = "group".equals(msgType)
                    ? String.valueOf(msg.get("group_id"))
                    : String.valueOf(msg.get("user_id"));
            ctx.getActions().sendMsg(msgType, peer, "你好，我是 Java 插件！");
        }
    }
}
```

**2. 在 `src/main/resources/META-INF/napcat-plugin.properties` 写入清单**：

```properties
id=hello-plugin
name=Hello Plugin
version=1.0.0
description=我的第一个 Java 插件
author=YourName
entry=com.example.HelloPlugin
```

**3. 打包成 JAR，放入 `java-plugins/` 目录**：

```
<NapCat工作目录>/config/plugins/napcat-plugin-jni/java-plugins/hello-plugin.jar
```

**4. 在 WebUI 重载 JNI 插件**，机器人收到「你好」时会自动回复。

---

## 二、Maven 依赖

```xml
<dependency>
    <groupId>io.github.cindifind</groupId>
    <artifactId>napcat-jni-sdk</artifactId>
    <version>1.0.0</version>
    <scope>provided</scope>
</dependency>
```

> `scope=provided`：运行时由桥接器 `napcat-jni-bridge.jar` 提供，避免你的 JAR 重复打包依赖冲突。
>
> Gradle：
> ```gradle
> compileOnly 'io.github.cindifind:napcat-jni-sdk:1.0.0'
> ```

---

## 三、插件清单文件

SDK 支持三种插件发现方式，按优先级：

| 优先级 | 方式 | 文件位置 | 说明 |
|:--|:--|:--|:--|
| 1 | **properties 清单（推荐）** | `META-INF/napcat-plugin.properties` | 标准方式，字段完整 |
| 2 | JAR Manifest | `MANIFEST.MF` | 通过 `NapCat-Plugin-Entry` 等属性 |
| 3 | ServiceLoader | `META-INF/services/com.napcat.jni.plugin.NapCatPlugin` | 文件内容为实现类全名 |

### `napcat-plugin.properties` 字段

| 字段 | 必填 | 说明 |
|:--|:--|:--|
| `id` | ✅ | 插件唯一 ID（建议小写连字符，如 `my-plugin`） |
| `name` | ❌ | 显示名称 |
| `version` | ❌ | 版本号（默认 `1.0.0`） |
| `description` | ❌ | 描述 |
| `author` | ❌ | 作者 |
| `entry` | ✅ | 实现 `NapCatPlugin` 的类全名（如 `com.example.HelloPlugin`） |

**示例：**

```properties
id=my-plugin
name=我的插件
version=2.1.0
description=一个强大的插件
author=Me
entry=com.example.MyPlugin
```

### JAR Manifest 方式

在 `pom.xml` 的 `maven-jar-plugin` 中配置：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <configuration>
        <archive>
            <manifestEntries>
                <NapCat-Plugin-Id>my-plugin</NapCat-Plugin-Id>
                <NapCat-Plugin-Name>我的插件</NapCat-Plugin-Name>
                <NapCat-Plugin-Version>1.0.0</NapCat-Plugin-Version>
                <NapCat-Plugin-Author>Me</NapCat-Plugin-Author>
                <NapCat-Plugin-Entry>com.example.MyPlugin</NapCat-Plugin-Entry>
            </manifestEntries>
        </archive>
    </configuration>
</plugin>
```

---

## 四、核心接口

### 4.1 `NapCatPlugin`（插件接口）

**包路径：** `com.napcat.jni.plugin.NapCatPlugin`

所有 Java 插件必须实现此接口。生命周期对应 Node 侧 `PluginModule`。

#### 方法列表

| 方法签名 | 触发时机 | 是否必填 |
|:--|:--|:--|
| `void onInit(NapCatPluginContext ctx)` | 插件加载时（`plugin_init`） | ✅ 必填 |
| `void onMessage(NapCatPluginContext ctx, Object messageEvent)` | 收到 OneBot 消息事件 | ❌ 默认空实现 |
| `void onEvent(NapCatPluginContext ctx, Object event)` | 收到任何 OneBot 事件 | ❌ 默认空实现 |
| `void onCleanup(NapCatPluginContext ctx)` | 插件卸载时（`plugin_cleanup`） | ❌ 默认空实现 |

#### 生命周期流程

```
插件加载 → onInit() ──→ (运行中) ──→ onCleanup() → 插件卸载
                          ↑↓
                   onMessage / onEvent 反复触发
```

#### 说明

- `onMessage` 仅在事件包含 `message_type` 字段时触发（即 OneBot 的消息事件）
- `onEvent` 对所有 OneBot 事件触发（消息、通知、请求、元事件）
- 同一事件会**同时**触发 `onMessage` 和 `onEvent`（如果是消息事件）
- 所有方法都允许抛 `Exception`，抛出后会被桥接器捕获并记录日志，不会崩溃整个进程

#### `messageEvent` 字段（OneBot 11 标准消息事件）

| 字段 | 类型 | 说明 |
|:--|:--|:--|
| `post_type` | string | 固定 `"message"` |
| `message_type` | string | `"private"` 或 `"group"` |
| `sub_type` | string | 子类型 |
| `message_id` | int | 消息 ID |
| `user_id` | int | 发送者 QQ |
| `group_id` | int | 群号（私聊无此字段） |
| `raw_message` | string | 原始消息文本 |
| `message` | array | 消息段数组 |
| `self_id` | int | 机器人 QQ |

**访问方式：**

```java
Map<String, Object> msg = PluginLoader.eventToMap(messageEvent);
String text = (String) msg.get("raw_message");
```

---

### 4.2 `NapCatPluginContext`（插件上下文）

**包路径：** `com.napcat.jni.plugin.NapCatPluginContext`

提供插件运行所需的信息与能力。在 `onInit` 时传入，建议保存为字段。

#### 方法列表

| 方法签名 | 返回值 | 说明 |
|:--|:--|:--|
| `String getDataPath()` | 数据目录路径 | 全局数据目录，用于持久化配置 |
| `String getJavaPluginPath()` | Java 插件根目录 | 所有 Java 插件存放位置 |
| `String getAdapterName()` | 适配器名称 | 通常为 `"onebot11"` |
| `String getPluginId()` | 当前插件 ID | 对应清单中的 `id` |
| `String getPluginPath()` | 当前插件专属目录 | 建议在此目录读写插件私有数据 |
| `Actions getActions()` | OneBot Action 客户端 | 用于调用 OneBot API |
| `PluginLogger getLogger()` | 日志接口 | 输出日志到 Node 侧统一管理 |
| `void emitEvent(Object event)` | — | 推送自定义 OneBot 事件 |
| `Object getRawBridge()` | 原始桥接实例 | 高级用法，通常无需调用 |

#### 使用示例

```java
@Override
public void onInit(NapCatPluginContext ctx) {
    this.ctx = ctx;
    // 写入插件私有数据
    Path dataFile = Paths.get(ctx.getPluginPath(), "config.json");
    Files.writeString(dataFile, "{\"enabled\":true}");

    // 查询机器人信息
    ctx.getActions().getLoginInfo().thenAccept(result -> {
        ctx.getLogger().info("当前登录号: {}", result);
    });
}
```

---

### 4.3 `Actions`（OneBot Action 客户端）

**包路径：** `com.napcat.jni.plugin.Actions`

调用 OneBot 11 API 的客户端，所有方法均为**异步**，返回 `CompletableFuture<Object>`。

#### 核心方法

| 方法签名 | 说明 |
|:--|:--|
| `CompletableFuture<Object> call(String action, Object params)` | 通用 Action 调用，默认 30 秒超时 |
| `CompletableFuture<Object> call(String action, Object params, long timeout, TimeUnit unit)` | 自定义超时 |

#### 便捷方法（默认实现）

| 方法签名 | 对应 OneBot Action |
|:--|:--|
| `sendPrivateMessage(String userId, Object message)` | `send_private_msg` |
| `sendGroupMessage(String groupId, Object message)` | `send_group_msg` |
| `sendMsg(String messageType, String peerId, Object message)` | `send_msg` |
| `getLoginInfo()` | `get_login_info` |
| `getVersionInfo()` | `get_version_info` |
| `getFriendList()` | `get_friend_list` |
| `getGroupList()` | `get_group_list` |
| `getGroupMemberList(String groupId)` | `get_group_member_list` |
| `deleteMsg(int messageId)` | `delete_msg` |
| `getMsg(int messageId)` | `get_msg` |

#### 静态工具方法

| 方法签名 | 说明 |
|:--|:--|
| `static List<Map<String, Object>> textSegments(String text)` | 构造文本消息段 |

#### 调用方式

**1. 异步回调（推荐）：**

```java
ctx.getActions().sendGroupMessage("123456", "Hello")
    .thenAccept(result -> ctx.getLogger().info("发送成功: {}", result))
    .exceptionally(ex -> {
        ctx.getLogger().error("发送失败", ex);
        return null;
    });
```

**2. 同步等待（阻塞当前线程）：**

```java
try {
    Object result = ctx.getActions().getLoginInfo().get(30, TimeUnit.SECONDS);
    ctx.getLogger().info("登录号信息: {}", result);
} catch (Exception e) {
    ctx.getLogger().error("查询失败", e);
}
```

> ⚠️ **警告**：不要在 `onMessage` 中同步等待，会阻塞消息分发线程。推荐使用异步回调。

**3. 发送复杂消息（图片、AT 等）：**

```java
import java.util.List;
import java.util.Map;

List<Map<String, Object>> segments = List.of(
    Map.of("type", "at", "data", Map.of("qq", "123456")),
    Map.of("type", "text", "data", Map.of("text", " 你好")),
    Map.of("type", "image", "data", Map.of("url", "https://example.com/img.png"))
);
ctx.getActions().sendGroupMessage("123456", segments);
```

**4. 调用任意 Action（便捷方法未覆盖的）：**

```java
ctx.getActions().call("set_group_kick", Map.of(
    "group_id", "123456",
    "user_id", "654321",
    "reject_add_request", false
));
```

#### 返回值结构

`CompletableFuture<Object>` 中的 `Object` 实际是 Jackson 解析后的对象：
- OneBot 响应的 `data` 字段为对象 → 返回 `Map<String, Object>`
- OneBot 响应的 `data` 字段为数组 → 返回 `List<Map<String, Object>>`
- OneBot 响应的 `data` 字段为标量 → 返回 `String`/`Integer` 等

例如 `getLoginInfo()` 返回：

```java
Map<String, Object> data = (Map<String, Object>) future.get();
int userId = (Integer) data.get("user_id");
String nickname = (String) data.get("nickname");
```

---

### 4.4 `PluginLogger`（日志接口）

**包路径：** `com.napcat.jni.plugin.PluginLogger`

日志会通过桥接器转发到 Node 侧，与 NapCat 主日志统一管理（可在 WebUI「猫猫日志」查看）。

#### 方法列表

| 方法签名 | 日志级别 |
|:--|:--|
| `void log(String message, Object... args)` | 普通日志 |
| `void debug(String message, Object... args)` | DEBUG |
| `void info(String message, Object... args)` | INFO |
| `void warn(String message, Object... args)` | WARN |
| `void error(String message, Object... args)` | ERROR |
| `void error(String message, Throwable t)` | ERROR（带异常） |

#### 占位符语法

使用 SLF4J 风格的 `{}` 占位符：

```java
ctx.getLogger().info("用户 {} 在群 {} 发送了消息", userId, groupId);
ctx.getLogger().error("处理失败", exception);
```

> ⚠️ 日志通过 stdout NDJSON 发送到 Node 侧，**不要直接用 `System.out.println`**，会破坏协议。

---

### 4.5 `PluginLoader`（插件加载器）

**包路径：** `com.napcat.jni.plugin.PluginLoader`

负责插件扫描、加载、卸载。普通插件开发者通常无需直接使用，但其中有一个**常用静态工具方法**。

#### 实例方法

| 方法签名 | 说明 |
|:--|:--|
| `PluginLoader(File pluginDir)` | 构造函数，指定插件目录 |
| `List<JavaPluginInfo> scan()` | 扫描目录，收集所有插件元信息（不加载） |
| `NapCatPlugin load(String pluginId, NapCatPluginContext ctx)` | 加载指定插件并调用 `onInit` |
| `boolean unload(String pluginId, NapCatPluginContext ctx)` | 卸载指定插件并调用 `onCleanup` |
| `Map<String, NapCatPlugin> loadAll(BiFunction<String, String, NapCatPluginContext> contextFactory)` | 加载所有 `enabled=true` 的插件 |

#### 静态工具方法

| 方法签名 | 说明 |
|:--|:--|
| `static Map<String, Object> eventToMap(Object event)` | 把 OneBot 事件对象（JsonNode / Map）统一转 `Map<String, Object>` |

**`eventToMap` 使用示例：**

```java
@Override
public void onMessage(NapCatPluginContext ctx, Object messageEvent) throws Exception {
    Map<String, Object> msg = PluginLoader.eventToMap(messageEvent);
    String text = String.valueOf(msg.get("raw_message"));
    int messageId = (Integer) msg.get("message_id");
    // ...
}
```

---

## 五、进阶 API

### 5.1 `NapCatBridge`（桥接器核心）

**包路径：** `com.napcat.jni.core.NapCatBridge`

负责 stdin/stdout 双向通信、消息分发、Action 调用匹配。**插件开发者通常无需直接使用**，仅在以下场景需要：

- 自定义宿主程序（不使用 SDK 提供的 `Main` 类）
- 调用底层通信能力

#### 主要方法

| 方法签名 | 说明 |
|:--|:--|
| `void start()` | 启动 stdin 读取线程 |
| `void stop()` | 停止桥接器 |
| `void sendReady()` | 发送 `ready` 通知，告诉 Node 侧已就绪 |
| `void sendLog(String level, String message, Object... args)` | 发送日志通知 |
| `void onRequest(String method, BiFunction handler)` | 注册请求处理器 |
| `void onNotification(String method, Function handler)` | 注册通知处理器 |
| `void callAction(String action, Object params, TriConsumer callback, long timeoutMs)` | 发起 Action 调用 |
| `void emitEvent(Object event)` | 推送自定义事件 |
| `void sendNotification(String method, Object params)` | 发送任意通知 |
| `void sendResponse(Object id, Object result)` | 发送响应 |
| `void sendError(Object id, int code, String message)` | 发送错误 |
| `static <T> T fromJsonNode(JsonNode node, Class<T> cls)` | JsonNode 反序列化 |

#### 函数式接口

SDK 自定义了允许抛 `Exception` 的函数式接口：

```java
// 双参函数（请求处理）
@FunctionalInterface
public interface BiFunction<T, U, R> {
    R apply(T t, U u) throws Exception;
}

// 单参函数（通知处理）
@FunctionalInterface
public interface Function<T, R> {
    R apply(T t) throws Exception;
}

// 三参 Consumer（Action 回调）
@FunctionalInterface
public interface TriConsumer<A, B, C> {
    void accept(A a, B b, C c);
}
```

#### 自定义宿主示例

```java
public class CustomHost {
    public static void main(String[] args) throws Exception {
        NapCatBridge bridge = new NapCatBridge();

        // 注册 init 请求处理器
        bridge.onRequest("init", (id, params) -> {
            ProtocolTypes.InitParams p = NapCatBridge.fromJsonNode(params, ProtocolTypes.InitParams.class);
            // 初始化逻辑...
            return new ProtocolTypes.InitResult("1.0.0", new ProtocolTypes.JavaPluginInfo[0]);
        });

        // 注册消息通知处理器
        bridge.onNotification("onMessage", params -> {
            Map<String, Object> msg = NapCatBridge.MAPPER.convertValue(params, Map.class);
            System.err.println("收到消息: " + msg.get("raw_message"));
            return null;
        });

        bridge.start();
        bridge.sendReady();
    }
}
```

---

### 5.2 `ProtocolTypes`（协议类型）

**包路径：** `com.napcat.jni.protocol.ProtocolTypes`

包含所有 JSON-RPC 通信的参数和返回类型。插件开发者常用 `JavaPluginInfo`。

#### 内部类

| 类名 | 用途 |
|:--|:--|
| `InitParams` | Node → Java `init` 请求参数（dataPath、javaPluginPath、adapterName 等） |
| `InitResult` | Java → Node `init` 响应（version、plugins[]） |
| `JavaPluginInfo` | 插件元信息（id、name、version、entry、enabled） |
| `EventParams` | `onMessage` / `onEvent` 通知参数 |
| `PluginOperationParams` | `loadPlugin` / `unloadPlugin` 请求参数 |
| `LogNotificationParams` | Java → Node 日志通知 |
| `CallActionNotificationParams` | Java → Node Action 调用请求 |
| `CallActionResultParams` | Node → Java Action 结果回传 |
| `EmitEventNotificationParams` | Java → Node 自定义事件推送 |

#### `JavaPluginInfo` 字段

```java
public static class JavaPluginInfo {
    public String id;          // 插件 ID
    public String name;        // 显示名称
    public String version;     // 版本
    public String description; // 描述
    public String author;      // 作者
    public String entry;       // 入口类全名
    public boolean enabled;    // 是否启用
}
```

---

## 六、完整示例

### 示例 1：关键词回复机器人

```java
package com.example;

import com.napcat.jni.plugin.*;
import java.util.Map;

public class KeywordPlugin implements NapCatPlugin {
    private NapCatPluginContext ctx;

    @Override
    public void onInit(NapCatPluginContext ctx) {
        this.ctx = ctx;
        ctx.getLogger().info("关键词插件已加载");
    }

    @Override
    public void onMessage(NapCatPluginContext ctx, Object messageEvent) throws Exception {
        Map<String, Object> msg = PluginLoader.eventToMap(messageEvent);
        String text = String.valueOf(msg.get("raw_message"));
        String msgType = String.valueOf(msg.get("message_type"));
        String peer = "group".equals(msgType)
                ? String.valueOf(msg.get("group_id"))
                : String.valueOf(msg.get("user_id"));

        String reply = null;
        if (text.contains("天气")) {
            reply = "今天天气晴朗 ☀️";
        } else if (text.contains("时间")) {
            reply = "现在是 " + java.time.LocalTime.now();
        }

        if (reply != null) {
            ctx.getActions().sendMsg(msgType, peer, reply);
        }
    }
}
```

### 示例 2：群成员加入欢迎

```java
package com.example;

import com.napcat.jni.plugin.*;
import java.util.Map;

public class WelcomePlugin implements NapCatPlugin {
    @Override
    public void onInit(NapCatPluginContext ctx) {
        ctx.getLogger().info("欢迎插件已加载");
    }

    @Override
    public void onEvent(NapCatPluginContext ctx, Object event) throws Exception {
        Map<String, Object> ev = PluginLoader.eventToMap(event);
        String postType = String.valueOf(ev.get("post_type"));
        String noticeType = String.valueOf(ev.get("notice_type"));

        if ("notice".equals(postType) && "group_increase".equals(noticeType)) {
            String groupId = String.valueOf(ev.get("group_id"));
            String userId = String.valueOf(ev.get("user_id"));
            String welcome = "欢迎新成员 <at qq=\"" + userId + "\"> 加入本群！";
            ctx.getActions().sendGroupMessage(groupId, welcome);
        }
    }
}
```

### 示例 3：定时任务（每天 8 点问好）

```java
package com.example;

import com.napcat.jni.plugin.*;
import java.util.Map;
import java.util.concurrent.*;

public class SchedulePlugin implements NapCatPlugin {
    private NapCatPluginContext ctx;
    private ScheduledExecutorService scheduler;

    @Override
    public void onInit(NapCatPluginContext ctx) {
        this.ctx = ctx;
        scheduler = Executors.newSingleThreadScheduledExecutor();

        // 模拟：启动 10 秒后发一条测试消息
        scheduler.schedule(() -> {
            ctx.getActions().sendGroupMessage("123456", "定时消息测试")
                .thenAccept(r -> ctx.getLogger().info("发送成功"));
        }, 10, TimeUnit.SECONDS);

        ctx.getLogger().info("定时任务插件已加载");
    }

    @Override
    public void onCleanup(NapCatPluginContext ctx) {
        if (scheduler != null) scheduler.shutdownNow();
    }
}
```

### 示例 4：持久化配置

```java
package com.example;

import com.napcat.jni.plugin.*;
import java.nio.file.*;
import java.util.Map;

public class ConfigPlugin implements NapCatPlugin {
    private NapCatPluginContext ctx;
    private Path configFile;
    private Map<String, Object> config;

    @Override
    public void onInit(NapCatPluginContext ctx) throws Exception {
        this.ctx = ctx;
        this.configFile = Paths.get(ctx.getPluginPath(), "config.json");

        if (Files.exists(configFile)) {
            String json = Files.readString(configFile);
            config = NapCatBridge.MAPPER.readValue(json, Map.class);
        } else {
            config = Map.of("enabled", true, "keywords", new String[]{"你好", "天气"});
            saveConfig();
        }
    }

    @Override
    public void onCleanup(NapCatPluginContext ctx) {
        saveConfig();
    }

    private void saveConfig() {
        try {
            Files.createDirectories(configFile.getParent());
            Files.writeString(configFile, NapCatBridge.MAPPER.writeValueAsString(config));
        } catch (Exception e) {
            ctx.getLogger().error("保存配置失败", e);
        }
    }
}
```

---

## 七、常见问题

### Q1：插件加载失败，提示 `ClassNotFoundException`

**原因：** 清单文件中的 `entry` 字段与实际类名不符，或 JAR 中没有该类。

**解决：** 检查 `META-INF/napcat-plugin.properties` 的 `entry` 字段，确保是完整的类全名（含包名），如 `com.example.HelloPlugin`。

---

### Q2：Action 调用一直没有返回

**原因：** 默认超时 30 秒，可能 OneBot Action 执行较慢或 Node 侧无响应。

**解决：**
- 使用异步回调而非同步 `get()`
- 检查 NapCat 主日志是否有 Action 执行错误
- 自定义超时：`actions.call("send_msg", params, 60, TimeUnit.SECONDS)`

---

### Q3：日志在哪里查看？

- **WebUI**：「猫猫日志」页面，可按级别筛选
- **文件**：`<NapCat工作目录>/logs/` 目录下的日志文件
- **Java 侧 stderr**：通过 `slf4j-simple` 输出到 stderr，会被 Node 侧捕获

---

### Q4：能否使用第三方库（如数据库驱动、HTTP 客户端）？

**可以。** 把依赖打进你的 JAR（使用 `maven-shade-plugin` 或 `maven-assembly-plugin`），SDK 依赖用 `provided` 作用域。每个插件有独立的 `ClassLoader`，不会互相冲突。

---

### Q5：插件抛异常会影响其他插件吗？

**不会。** 异常会被 `NapCatBridge` 捕获并记录日志，单个消息处理失败不影响其他插件和后续消息。

---

### Q6：如何调试插件？

1. 在 WebUI「猫猫日志」开启 DEBUG 级别
2. 在代码中用 `ctx.getLogger().debug(...)` 输出调试信息
3. 临时把异常堆栈打到日志：`ctx.getLogger().error("处理失败", e)`
4. 修改代码后重新打包 JAR，在 WebUI 点击「重载」即可，无需重启 QQ

---

### Q7：`System.out.println` 能用吗？

**不能用。** 桥接器通过 stdout 传输 JSON-RPC 协议，任何非协议内容都会破坏通信。请始终使用 `ctx.getLogger()` 输出日志（底层通过专门的 `log` 通知发送到 Node 侧）。

---

### Q8：如何推送自定义事件给其他客户端？

```java
Map<String, Object> customEvent = Map.of(
    "post_type", "napcat_custom",
    "event_type", "my_event",
    "data", Map.of("key", "value")
);
ctx.emitEvent(customEvent);
```

订阅了 OneBot 事件的客户端（如 WebSocket、HTTP POST 上报）都会收到此事件。

---

## 附录：完整 API 速查表

| 类/接口 | 主要方法 | 用途 |
|:--|:--|:--|
| `NapCatPlugin` | `onInit` / `onMessage` / `onEvent` / `onCleanup` | 插件入口 |
| `NapCatPluginContext` | `getActions` / `getLogger` / `getDataPath` / `emitEvent` | 插件上下文 |
| `Actions` | `call` / `sendMsg` / `sendGroupMessage` / `getLoginInfo` | 调用 OneBot API |
| `PluginLogger` | `info` / `debug` / `warn` / `error` | 日志输出 |
| `PluginLoader` | `scan` / `load` / `unload` / `eventToMap` | 插件管理（静态方法常用） |
| `NapCatBridge` | `start` / `stop` / `onRequest` / `callAction` | 底层桥接器（高级） |
| `ProtocolTypes` | `InitParams` / `InitResult` / `JavaPluginInfo` | 协议类型定义 |

---

