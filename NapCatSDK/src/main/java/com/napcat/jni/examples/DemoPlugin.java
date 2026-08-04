package com.napcat.jni.examples;

import com.napcat.jni.plugin.NapCatPlugin;
import com.napcat.jni.plugin.NapCatPluginContext;
import com.napcat.jni.plugin.PluginLoader;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 示例 Java 插件：回显机器人
 * <p>
 * 功能：
 * <ul>
 *   <li>收到以 "!ping" 开头的消息时，回复 "pong" + 运行时间</li>
 *   <li>收到以 "!java" 开头的消息时，回复当前 JVM 信息</li>
 *   <li>所有消息在控制台打日志</li>
 * </ul>
 */
public class DemoPlugin implements NapCatPlugin {

    private NapCatPluginContext ctx;
    private long startTime;

    @Override
    public void onInit(NapCatPluginContext ctx) {
        this.ctx = ctx;
        this.startTime = System.currentTimeMillis();
        ctx.getLogger().info("DemoPlugin 初始化成功，数据目录: {}", ctx.getDataPath());
        ctx.getLogger().info("DemoPlugin 插件目录: {}", ctx.getPluginPath());
        ctx.getLogger().info("DemoPlugin 适配器: {}", ctx.getAdapterName());
    }

    @Override
    public void onMessage(NapCatPluginContext ctx, Object messageEvent) throws Exception {
        Map<String, Object> msg = PluginLoader.eventToMap(messageEvent);
        ctx.getLogger().debug("onMessage: {}", msg);

        String raw = str(msg.get("raw_message"));
        if (raw == null) return;

        String peer;
        String msgType = str(msg.get("message_type"));
        String reply = null;

        if ("group".equals(msgType)) {
            peer = str(msg.get("group_id"));
        } else {
            peer = str(msg.get("user_id"));
        }

        if (raw.startsWith("!ping")) {
            long uptime = (System.currentTimeMillis() - startTime) / 1000;
            reply = "pong! DemoPlugin 运行时间: " + uptime + "s";
        } else if (raw.startsWith("!java")) {
            reply = String.format(
                    "Java 信息\n  版本: %s\n  运行时: %s\n  可用内存: %.1f MB\n  处理中线程: %d",
                    System.getProperty("java.version"),
                    System.getProperty("java.vm.name"),
                    Runtime.getRuntime().freeMemory() / 1024.0 / 1024.0,
                    Thread.activeCount()
            );
        }

        if (reply != null && peer != null) {
            String finalPeer = peer;
            String finalReply = reply;
            CompletableFuture<Object> future = ctx.getActions().sendMsg(msgType, finalPeer, finalReply);
            future.whenComplete((result, err) -> {
                if (err != null) {
                    ctx.getLogger().error("回复失败", err);
                } else {
                    ctx.getLogger().info("已回复: {}", finalReply);
                }
            });
        }
    }

    @Override
    public void onEvent(NapCatPluginContext ctx, Object event) throws Exception {
        Map<String, Object> ev = PluginLoader.eventToMap(event);
        Object postType = ev.get("post_type");
        Object subType = ev.getOrDefault("sub_type", ev.getOrDefault("notice_type", ev.getOrDefault("meta_event_type", "")));
        ctx.getLogger().debug("onEvent: post_type={}, subtype={}", postType, subType);
    }

    @Override
    public void onCleanup(NapCatPluginContext ctx) {
        ctx.getLogger().info("DemoPlugin 卸载完成");
    }

    private static String str(Object o) {
        return o == null ? null : o.toString();
    }
}
