package com.napcat.jni.plugin;

import com.napcat.jni.core.NapCatBridge;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * OneBot Action 客户端实现
 * <p>
 * 通过桥接器向 Node 侧发起 OneBot Action 调用，并以 CompletableFuture 形式返回结果。
 * 便捷方法（sendMsg / getLoginInfo 等）继承自 {@link Actions} 接口的默认实现。
 */
public class ActionsClient implements Actions {

    private final NapCatBridge bridge;
    private final long defaultTimeoutMs;

    public ActionsClient(NapCatBridge bridge) {
        this(bridge, 30_000L);
    }

    public ActionsClient(NapCatBridge bridge, long defaultTimeoutMs) {
        this.bridge = bridge;
        this.defaultTimeoutMs = defaultTimeoutMs;
    }

    @Override
    public CompletableFuture<Object> call(String action, Object params) {
        return call(action, params, defaultTimeoutMs, TimeUnit.MILLISECONDS);
    }

    @Override
    public CompletableFuture<Object> call(String action, Object params, long timeout, TimeUnit unit) {
        CompletableFuture<Object> future = new CompletableFuture<>();
        long timeoutMs = unit.toMillis(timeout);
        bridge.callAction(action, params, (ok, data, err) -> {
            if (future.isDone()) return;
            if (ok) {
                future.complete(data);
            } else {
                future.completeExceptionally(new RuntimeException(err == null ? "Action failed" : err));
            }
        }, timeoutMs);
        // 桥接器自身内部会触发超时回调；Java 8 兼容：exceptionally 统一处理 TimeoutException
        return future.exceptionally(ex -> {
            Throwable t = ex;
            if (t instanceof java.util.concurrent.CompletionException && t.getCause() != null) {
                t = t.getCause();
            }
            if (t instanceof TimeoutException) {
                throw new RuntimeException("Action '" + action + "' timed out after " + timeoutMs + "ms");
            }
            if (t instanceof RuntimeException) throw (RuntimeException) t;
            throw new RuntimeException(t);
        });
    }
}
