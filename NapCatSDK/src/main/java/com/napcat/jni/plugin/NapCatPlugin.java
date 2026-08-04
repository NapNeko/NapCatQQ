package com.napcat.jni.plugin;

/**
 * NapCat Java 插件接口
 * <p>
 * 所有 Java 插件都需要实现此接口并提供无参构造函数。
 * 生命周期对应 Node 侧 PluginModule：
 * <ul>
 *   <li>{@link #onInit(NapCatPluginContext)} → plugin_init</li>
 *   <li>{@link #onMessage(NapCatPluginContext, Object)} → plugin_onmessage</li>
 *   <li>{@link #onEvent(NapCatPluginContext, Object)} → plugin_onevent</li>
 *   <li>{@link #onCleanup(NapCatPluginContext)} → plugin_cleanup</li>
 * </ul>
 */
public interface NapCatPlugin {

    /** 插件初始化：创建资源、注册配置等 */
    void onInit(NapCatPluginContext ctx) throws Exception;

    /**
     * 接收 OneBot 11 消息事件（message_type 存在时触发）。
     * <p>
     * message 事件以 JSON 对象形式传入，使用 {@link java.util.Map} 或 Jackson JsonNode 访问字段。
     * 如需发送消息，请使用 {@link NapCatPluginContext#getActions()}
     */
    default void onMessage(NapCatPluginContext ctx, Object messageEvent) throws Exception {
    }

    /** 接收所有 OneBot 事件（包括消息、通知、请求、元事件） */
    default void onEvent(NapCatPluginContext ctx, Object event) throws Exception {
    }

    /** 插件卸载：释放资源、保存配置 */
    default void onCleanup(NapCatPluginContext ctx) throws Exception {
    }
}
