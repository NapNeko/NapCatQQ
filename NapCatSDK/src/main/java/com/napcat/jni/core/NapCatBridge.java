package com.napcat.jni.core;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.napcat.jni.protocol.JsonRpcError;
import com.napcat.jni.protocol.JsonRpcErrorResult;
import com.napcat.jni.protocol.JsonRpcNotification;
import com.napcat.jni.protocol.JsonRpcRequest;
import com.napcat.jni.protocol.JsonRpcSuccessResult;
import com.napcat.jni.util.Kv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.BiConsumer;
import java.util.function.Function;

/**
 * NapCat Java 桥接器核心
 * <p>
 * 负责：
 * <ul>
 *   <li>从 stdin 按行读取 JSON-RPC 消息（Node → Java）</li>
 *   <li>向 stdout 写 JSON-RPC 消息（Java → Node）</li>
 *   <li>消息分发（请求 → requestHandler；通知 → notificationHandler）</li>
 *   <li>Action 调用（Java → Node OneBot API）的请求/响应匹配</li>
 * </ul>
 * <p>
 * 使用方式：
 * <pre>{@code
 *   NapCatBridge bridge = new NapCatBridge();
 *   bridge.onRequest("init", (id, params) -> new InitResult());
 *   bridge.onNotification("onMessage", params -> ...);
 *   bridge.onActionResult(params -> ...);  // 接收 Node 侧 Action 调用结果
 *   bridge.start();
 *   bridge.sendReady();
 * }</pre>
 */
public class NapCatBridge {

    private static final Logger LOG = LoggerFactory.getLogger(NapCatBridge.class);

    public static final ObjectMapper MAPPER = new ObjectMapper();

    private final BufferedReader stdin;
    private final BufferedWriter stdout;
    private final ScheduledExecutorService scheduler;

    /** 请求处理器：method → (id, paramsJsonNode) -> result */
    private final ConcurrentMap<String, BiFunction<Object, JsonNode, Object>> requestHandlers = new ConcurrentHashMap<>();
    /** 通知处理器：method → paramsJsonNode consumer */
    private final ConcurrentMap<String, Function<JsonNode, Void>> notificationHandlers = new ConcurrentHashMap<>();

    /** Java 发起的 Action 调用：requestId → (ok, data, error) handler */
    private final ConcurrentMap<Object, TriConsumer<Boolean, Object, String>> actionCallbacks = new ConcurrentHashMap<>();
    private final AtomicLong actionSeq = new AtomicLong(0);

    private volatile boolean running = false;
    private Thread readerThread;

    /** 泛型三参 Consumer（用于 Action 回调） */
    @FunctionalInterface
    public interface TriConsumer<A, B, C> {
        void accept(A a, B b, C c);
    }

    /** 泛型双参 Function，允许抛异常 */
    @FunctionalInterface
    public interface BiFunction<T, U, R> {
        R apply(T t, U u) throws Exception;
    }

    /** 泛型单参 Function，允许抛异常 */
    @FunctionalInterface
    public interface Function<T, R> {
        R apply(T t) throws Exception;
    }

    public NapCatBridge() {
        this.stdin = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        this.stdout = new BufferedWriter(new OutputStreamWriter(System.out, StandardCharsets.UTF_8));
        this.scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "napcat-jni-scheduler");
            t.setDaemon(true);
            return t;
        });
    }

    // ==================== 生命周期 ====================

    /**
     * 启动 stdin 读取线程并开始分发消息。
     * 调用方在注册好 handler 后调用 start()，之后发送 ready 信号。
     */
    public synchronized void start() {
        if (running) return;
        running = true;
        readerThread = new Thread(this::runReader, "napcat-jni-stdin-reader");
        readerThread.setDaemon(false);
        readerThread.start();
        LOG.info("[NapCatBridge] stdin reader started");
    }

    public synchronized void stop() {
        if (!running) return;
        running = false;
        try {
            if (readerThread != null) readerThread.interrupt();
        } catch (Exception ignore) {
        }
        scheduler.shutdownNow();
        try {
            stdin.close();
        } catch (IOException ignore) {
        }
        try {
            stdout.close();
        } catch (IOException ignore) {
        }
    }

    public boolean isRunning() {
        return running;
    }

    // ==================== 消息读取 & 分发 ====================

    private void runReader() {
        try {
            String line;
            while (running && (line = stdin.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                try {
                    handleRawMessage(line);
                } catch (Exception e) {
                    LOG.warn("[NapCatBridge] Error handling message: {}", line, e);
                    sendError(null, JsonRpcError.INTERNAL_ERROR, "Failed to handle message: " + e.getMessage());
                }
            }
        } catch (IOException e) {
            if (running) {
                LOG.warn("[NapCatBridge] stdin read failed, bridge stopping: {}", e.getMessage());
            }
        } finally {
            running = false;
            LOG.info("[NapCatBridge] reader exited");
            // 触发调用方退出（宿主通常会在进程退出时直接 kill）
            System.exit(0);
        }
    }

    private void handleRawMessage(String line) throws Exception {
        JsonNode root = MAPPER.readTree(line);
        if (root == null || !root.has("jsonrpc")) {
            LOG.warn("[NapCatBridge] Invalid message (no jsonrpc): {}", line);
            return;
        }

        JsonNode idNode = root.get("id");
        String method = root.has("method") ? root.get("method").asText() : null;
        JsonNode params = root.get("params");
        boolean hasId = idNode != null && !idNode.isNull();
        boolean hasMethod = method != null;
        boolean hasResult = root.has("result");
        boolean hasError = root.has("error");

        // 1) Java 发起的 Action 调用结果（Node → action_result 通知）
        if ("action_result".equals(method) && hasId == false) {
            dispatchActionResult(params);
            return;
        }

        // 2) 响应（result / error）
        if ((hasResult || hasError) && hasId) {
            dispatchResponse(idNode, hasResult ? root.get("result") : null,
                    hasError ? root.get("error") : null);
            return;
        }

        // 3) 请求（有 id + method）
        if (hasId && hasMethod) {
            Object id = jsonNodeToId(idNode);
            dispatchRequest(id, method, params);
            return;
        }

        // 4) 通知（无 id + method）
        if (!hasId && hasMethod) {
            dispatchNotification(method, params);
            return;
        }

        LOG.warn("[NapCatBridge] Unrecognized message: {}", line);
    }

    private void dispatchRequest(Object id, String method, JsonNode params) {
        BiFunction<Object, JsonNode, Object> handler = requestHandlers.get(method);
        if (handler == null) {
            sendError(id, JsonRpcError.METHOD_NOT_FOUND, "Method not found: " + method);
            return;
        }
        try {
            Object result = handler.apply(id, params);
            sendResponse(id, result);
        } catch (Exception e) {
            LOG.error("[NapCatBridge] request handler error, method={}", method, e);
            sendError(id, JsonRpcError.INTERNAL_ERROR, e.getMessage());
        }
    }

    private void dispatchNotification(String method, JsonNode params) {
        Function<JsonNode, Void> handler = notificationHandlers.get(method);
        if (handler == null) {
            LOG.debug("[NapCatBridge] no handler for notification: {}", method);
            return;
        }
        try {
            handler.apply(params);
        } catch (Exception e) {
            LOG.error("[NapCatBridge] notification handler error, method={}", method, e);
        }
    }

    private void dispatchActionResult(JsonNode params) {
        if (params == null) return;
        Object requestId = params.has("requestId") ? jsonNodeToId(params.get("requestId")) : null;
        if (requestId == null) return;
        TriConsumer<Boolean, Object, String> cb = actionCallbacks.remove(requestId);
        if (cb == null) {
            LOG.warn("[NapCatBridge] no pending action callback for requestId={}", requestId);
            return;
        }
        boolean ok = params.has("ok") && params.get("ok").asBoolean(false);
        Object data = params.has("data") ? MAPPER.convertValue(params.get("data"), Object.class) : null;
        String error = params.has("error") && !params.get("error").isNull() ? params.get("error").asText() : null;
        try {
            cb.accept(ok, data, error);
        } catch (Exception e) {
            LOG.error("[NapCatBridge] action callback error", e);
        }
    }

    /** 响应回调（Node 返回的 Action 调用结果）—— 使用 action_result 通知分发，不需要实现此函数 */
    private void dispatchResponse(JsonNode idNode, JsonNode result, JsonNode error) {
        LOG.debug("[NapCatBridge] received response (ignoring), id={}", idNode);
    }

    // ==================== 发送消息 ====================

    public synchronized void sendResponse(Object id, Object result) {
        try {
            String json = MAPPER.writeValueAsString(new JsonRpcSuccessResult<>(id, result));
            writeLine(json);
        } catch (IOException e) {
            LOG.error("[NapCatBridge] Failed to send response", e);
        }
    }

    public synchronized void sendError(Object id, int code, String message) {
        try {
            JsonRpcError err = new JsonRpcError(code, message);
            String json = MAPPER.writeValueAsString(new JsonRpcErrorResult(id, err));
            writeLine(json);
        } catch (IOException e) {
            LOG.error("[NapCatBridge] Failed to send error response", e);
        }
    }

    public synchronized void sendNotification(String method, Object params) {
        try {
            String json = MAPPER.writeValueAsString(new JsonRpcNotification<>(method, params));
            writeLine(json);
        } catch (IOException e) {
            LOG.error("[NapCatBridge] Failed to send notification: {}", method, e);
        }
    }

    /** 发送 ready 通知，表示 Java 侧已准备好 */
    public void sendReady() {
        sendNotification("ready", null);
    }

    /** 发送日志通知到 Node 侧插件日志器 */
    public void sendLog(String level, String message, Object... args) {
        sendNotification("log", Kv.map(
                "level", level,
                "message", message == null ? "" : message,
                "args", args == null ? new Object[0] : args
        ));
    }

    private void writeLine(String line) throws IOException {
        stdout.write(line);
        stdout.newLine();
        stdout.flush();
    }

    // ==================== Handler 注册 ====================

    public void onRequest(String method, BiFunction<Object, JsonNode, Object> handler) {
        requestHandlers.put(method, handler);
    }

    public void onNotification(String method, Function<JsonNode, Void> handler) {
        notificationHandlers.put(method, handler);
    }

    // ==================== Java → Node Action 调用 ====================

    /**
     * 发起 OneBot Action 调用（通过 notification，响应由 action_result 通知回传）。
     *
     * @param action OneBot action 名，如 send_msg
     * @param params action 参数
     * @param callback 回调：(ok, data, error)
     * @param timeoutMs 超时
     */
    public void callAction(String action, Object params, TriConsumer<Boolean, Object, String> callback, long timeoutMs) {
        long requestId = actionSeq.incrementAndGet();
        actionCallbacks.put(requestId, callback);
        // 超时清理
        scheduler.schedule(() -> {
            TriConsumer<Boolean, Object, String> cb = actionCallbacks.remove(requestId);
            if (cb != null) {
                try {
                    cb.accept(false, null, "Timeout after " + timeoutMs + "ms");
                } catch (Exception ignore) {
                }
            }
        }, timeoutMs, TimeUnit.MILLISECONDS);
        sendNotification("action", Kv.map(
                "requestId", requestId,
                "action", action,
                "params", params == null ? Kv.map() : params
        ));
    }

    /**
     * Java → Node 推送自定义事件（OneBot 自定义事件）
     */
    public void emitEvent(Object event) {
        sendNotification("event", Kv.map("event", event == null ? Kv.map() : event));
    }

    // ==================== 辅助方法 ====================

    public static Object jsonNodeToId(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.isNumber()) return node.asLong();
        return node.asText();
    }

    public static <T> T fromJsonNode(JsonNode node, Class<T> cls) {
        if (node == null || node.isNull()) return null;
        return MAPPER.convertValue(node, cls);
    }

    public static <T> T fromJsonNode(JsonNode node, TypeReference<T> ref) {
        if (node == null || node.isNull()) return null;
        return MAPPER.convertValue(node, ref);
    }
}
