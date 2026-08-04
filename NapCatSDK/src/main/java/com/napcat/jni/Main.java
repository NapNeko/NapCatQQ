package com.napcat.jni;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.napcat.jni.core.NapCatBridge;
import com.napcat.jni.plugin.Actions;
import com.napcat.jni.plugin.ActionsClient;
import com.napcat.jni.plugin.NapCatPlugin;
import com.napcat.jni.plugin.NapCatPluginContext;
import com.napcat.jni.plugin.PluginLoader;
import com.napcat.jni.plugin.PluginLogger;
import com.napcat.jni.protocol.ProtocolTypes;
import com.napcat.jni.util.Kv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * NapCat Java 桥接主入口
 * <p>
 * 启动流程：
 * <ol>
 *   <li>Node.js 侧通过子进程方式启动本 JAR（java -jar napcat-jni-bridge.jar）</li>
 *   <li>Main 创建 {@link NapCatBridge}，启动 stdin 读取线程</li>
 *   <li>发送 ready 通知，表示 Java 侧已就绪</li>
 *   <li>收到 init 请求后，初始化 {@link PluginLoader}，扫描插件并加载</li>
 *   <li>处理 onMessage / onEvent 通知分发，loadPlugin / unloadPlugin 请求，cleanup 请求</li>
 * </ol>
 */
public class Main {

    private static final Logger LOG = LoggerFactory.getLogger(Main.class);
    public static final ObjectMapper MAPPER = new ObjectMapper();

    public static final String SDK_VERSION = "1.0.0";

    private static NapCatBridge bridge;
    private static PluginLoader pluginLoader;
    private static ProtocolTypes.InitParams initParams;
    private static Actions actions;
    private static final ConcurrentMap<String, NapCatPluginContext> pluginContexts = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        LOG.info("[Main] NapCat JNI Bridge v{} starting...", SDK_VERSION);

        bridge = new NapCatBridge();

        // 注册请求处理器
        bridge.onRequest("init", (id, params) -> handleInit(id, params));
        bridge.onRequest("listPlugins", (id, params) -> handleListPlugins(id, params));
        bridge.onRequest("loadPlugin", (id, params) -> handleLoadPlugin(id, params));
        bridge.onRequest("unloadPlugin", (id, params) -> handleUnloadPlugin(id, params));
        bridge.onRequest("cleanup", (id, params) -> handleCleanup(id, params));

        // 注册通知处理器
        bridge.onNotification("onMessage", params -> {
            handleOnMessage(params);
            return null;
        });
        bridge.onNotification("onEvent", params -> {
            handleOnEvent(params);
            return null;
        });

        // 注册 JVM 钩子，确保优雅退出
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                LOG.info("[Main] shutdown hook triggered");
                if (pluginLoader != null) {
                    for (String pid : pluginLoader.getLoaded().keySet()) {
                        NapCatPluginContext ctx = pluginContexts.get(pid);
                        pluginLoader.unload(pid, ctx);
                    }
                }
            } catch (Exception ignore) {
            }
        }, "napcat-jni-shutdown"));

        // 启动 stdin 读取
        bridge.start();

        // 通知 Node 侧：已就绪
        bridge.sendReady();
        bridge.sendLog("info", "NapCat Java Bridge v" + SDK_VERSION + " ready");

        // 主线程保持存活，直到 reader 退出
        try {
            while (bridge.isRunning()) {
                Thread.sleep(500);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        LOG.info("[Main] bridge stopped, exiting");
        System.exit(0);
    }

    // ==================== 请求处理 ====================

    private static Object handleInit(Object id, JsonNode paramsNode) {
        ProtocolTypes.InitParams params = NapCatBridge.fromJsonNode(paramsNode, ProtocolTypes.InitParams.class);
        if (params == null) {
            throw new IllegalArgumentException("Missing init params");
        }
        initParams = params;

        File pluginDir = new File(params.javaPluginPath);
        if (!pluginDir.isDirectory()) {
            // 自动创建插件目录
            if (!pluginDir.mkdirs()) {
                LOG.warn("[Main] cannot create java plugin dir: {}", pluginDir);
            }
        }

        pluginLoader = new PluginLoader(pluginDir);
        actions = new ActionsClient(bridge);

        // 扫描插件（不加载，由 Node 侧或用户决定何时加载）
        ProtocolTypes.JavaPluginInfo[] infos = pluginLoader.scan().toArray(new ProtocolTypes.JavaPluginInfo[0]);
        LOG.info("[Main] init ok, dataPath={}, javaPluginPath={}, discovered {} plugins",
                params.dataPath, params.javaPluginPath, infos.length);

        // 尝试自动加载启用的插件
        autoLoadEnabledPlugins();

        return new ProtocolTypes.InitResult(SDK_VERSION, infos);
    }

    private static Object handleListPlugins(Object id, JsonNode params) {
        if (pluginLoader == null) return new ProtocolTypes.InitResult(SDK_VERSION, new ProtocolTypes.JavaPluginInfo[0]);
        return new ProtocolTypes.InitResult(SDK_VERSION,
                pluginLoader.getInfos().toArray(new ProtocolTypes.JavaPluginInfo[0]));
    }

    private static Object handleLoadPlugin(Object id, JsonNode params) throws Exception {
        ProtocolTypes.PluginOperationParams p = NapCatBridge.fromJsonNode(params, ProtocolTypes.PluginOperationParams.class);
        if (pluginLoader == null) throw new IllegalStateException("Plugin loader not initialized");
        if (p == null || p.pluginId == null) throw new IllegalArgumentException("Missing pluginId");
        NapCatPluginContext ctx = createContextFor(p.pluginId);
        pluginContexts.put(p.pluginId, ctx);
        pluginLoader.load(p.pluginId, ctx);
        return Kv.map("ok", true, "pluginId", p.pluginId);
    }

    private static Object handleUnloadPlugin(Object id, JsonNode params) {
        ProtocolTypes.PluginOperationParams p = NapCatBridge.fromJsonNode(params, ProtocolTypes.PluginOperationParams.class);
        if (pluginLoader == null) throw new IllegalStateException("Plugin loader not initialized");
        if (p == null || p.pluginId == null) throw new IllegalArgumentException("Missing pluginId");
        NapCatPluginContext ctx = pluginContexts.get(p.pluginId);
        boolean ok = pluginLoader.unload(p.pluginId, ctx);
        pluginContexts.remove(p.pluginId);
        return Kv.map("ok", ok, "pluginId", p.pluginId);
    }

    private static Object handleCleanup(Object id, JsonNode params) {
        if (pluginLoader != null) {
            for (String pid : pluginLoader.getLoaded().keySet()) {
                NapCatPluginContext ctx = pluginContexts.get(pid);
                try {
                    pluginLoader.unload(pid, ctx);
                } catch (Exception ignore) {
                }
            }
            pluginContexts.clear();
        }
        // 通知调用方：可以关闭进程
        new Thread(() -> {
            try {
                Thread.sleep(500);
            } catch (InterruptedException ignore) {
            }
            bridge.stop();
        }, "napcat-jni-cleanup-exit").start();
        return Kv.map("ok", true);
    }

    // ==================== 通知处理 ====================

    private static void handleOnMessage(JsonNode params) {
        if (pluginLoader == null || params == null) return;
        JsonNode ev = params.get("event");
        if (ev == null) return;
        Object eventObj = MAPPER.convertValue(ev, Object.class);
        for (Map.Entry<String, NapCatPlugin> entry : pluginLoader.getLoaded().entrySet()) {
            NapCatPlugin plugin = entry.getValue();
            NapCatPluginContext ctx = pluginContexts.get(entry.getKey());
            if (ctx == null) continue;
            try {
                plugin.onMessage(ctx, eventObj);
            } catch (Exception e) {
                LOG.warn("[Main] plugin {} onMessage error", entry.getKey(), e);
                bridge.sendLog("error", "plugin " + entry.getKey() + " onMessage error: " + e.getMessage());
            }
        }
    }

    private static void handleOnEvent(JsonNode params) {
        if (pluginLoader == null || params == null) return;
        JsonNode ev = params.get("event");
        if (ev == null) return;
        Object eventObj = MAPPER.convertValue(ev, Object.class);
        for (Map.Entry<String, NapCatPlugin> entry : pluginLoader.getLoaded().entrySet()) {
            NapCatPlugin plugin = entry.getValue();
            NapCatPluginContext ctx = pluginContexts.get(entry.getKey());
            if (ctx == null) continue;
            try {
                plugin.onEvent(ctx, eventObj);
            } catch (Exception e) {
                LOG.warn("[Main] plugin {} onEvent error", entry.getKey(), e);
                bridge.sendLog("error", "plugin " + entry.getKey() + " onEvent error: " + e.getMessage());
            }
        }
    }

    // ==================== 辅助 ====================

    private static void autoLoadEnabledPlugins() {
        if (pluginLoader == null || initParams == null) return;
        for (ProtocolTypes.JavaPluginInfo info : pluginLoader.getInfos()) {
            if (!info.enabled) continue;
            try {
                NapCatPluginContext ctx = createContextFor(info.id);
                pluginContexts.put(info.id, ctx);
                pluginLoader.load(info.id, ctx);
                LOG.info("[Main] auto-loaded plugin: {}", info.id);
            } catch (Exception e) {
                LOG.error("[Main] auto-load plugin {} failed", info.id, e);
                bridge.sendLog("error", "auto-load plugin " + info.id + " failed: " + e.getMessage());
            }
        }
    }

    private static NapCatPluginContext createContextFor(String pluginId) {
        String dataPath = initParams == null ? "./data" : initParams.dataPath;
        String pluginDir = initParams == null ? "./java-plugins" : initParams.javaPluginPath;
        String adapterName = initParams == null ? "default" : initParams.adapterName;
        File pluginRoot = new File(pluginDir, sanitize(pluginId));
        Actions acts = actions == null ? new ActionsClient(bridge) : actions;
        PluginLogger logger = new PluginLogger() {
            @Override
            public void log(String message, Object... args) { bridge.sendLog("log", format(pluginId, message), args); }
            @Override
            public void debug(String message, Object... args) { bridge.sendLog("debug", format(pluginId, message), args); }
            @Override
            public void info(String message, Object... args) { bridge.sendLog("info", format(pluginId, message), args); }
            @Override
            public void warn(String message, Object... args) { bridge.sendLog("warn", format(pluginId, message), args); }
            @Override
            public void error(String message, Object... args) { bridge.sendLog("error", format(pluginId, message), args); }
        };
        return new NapCatPluginContext() {
            @Override public String getDataPath() { return dataPath; }
            @Override public String getJavaPluginPath() { return pluginDir; }
            @Override public String getAdapterName() { return adapterName; }
            @Override public String getPluginId() { return pluginId; }
            @Override public String getPluginPath() { return pluginRoot.getAbsolutePath(); }
            @Override public Actions getActions() { return acts; }
            @Override public PluginLogger getLogger() { return logger; }
            @Override public void emitEvent(Object event) { bridge.emitEvent(event); }
            @Override public Object getRawBridge() { return bridge; }
        };
    }

    private static String format(String pluginId, String message) {
        return "[" + pluginId + "] " + (message == null ? "" : message);
    }

    private static String sanitize(String s) {
        return s == null ? "" : s.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
