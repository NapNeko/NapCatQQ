package com.napcat.jni.examples;

import com.napcat.jni.model.message.Message;
import com.napcat.jni.model.message.MessageSegment;
import com.napcat.jni.model.result.LoginInfo;
import com.napcat.jni.model.result.SendMsgResult;
import com.napcat.jni.plugin.NapCatPlugin;
import com.napcat.jni.plugin.NapCatPluginContext;
import com.napcat.jni.plugin.PluginLoader;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * 示例 Java 插件：展示 Model 化 API 用法
 * <p>
 * 功能：
 * <ul>
 *   <li>启动时获取登录号信息并打印</li>
 *   <li>收到 "!ping" 回复 "pong" + 运行时间</li>
 *   <li>收到 "!java" 回复 JVM 信息</li>
 *   <li>收到 "@机器人 你好" 回复一条带 @ 的消息</li>
 *   <li>收到 "!image" 回复一张图片</li>
 * </ul>
 * <p>
 * 此示例展示新 Model API 的用法，与旧版 Map 方式形成对比。
 */
public class DemoPlugin implements NapCatPlugin {

    private NapCatPluginContext ctx;
    private long startTime;
    private String selfId;

    @Override
    public void onInit(NapCatPluginContext ctx) {
        this.ctx = ctx;
        this.startTime = System.currentTimeMillis();
        ctx.getLogger().info("DemoPlugin 初始化成功，数据目录: {}", ctx.getDataPath());

        // 使用强类型 API 获取登录号信息
        ctx.getActions().getLoginInfoTyped()
                .thenAccept((LoginInfo info) -> {
                    selfId = String.valueOf(info.userId);
                    ctx.getLogger().info("当前登录账号: {} ({})", info.nickname, info.userId);
                })
                .exceptionally(ex -> {
                    ctx.getLogger().error("获取登录信息失败", ex);
                    return null;
                });
    }

    @Override
    public void onMessage(NapCatPluginContext ctx, Object messageEvent) throws Exception {
        Map<String, Object> msg = PluginLoader.eventToMap(messageEvent);
        ctx.getLogger().debug("onMessage: {}", msg);

        String raw = str(msg.get("raw_message"));
        if (raw == null) return;

        String msgType = str(msg.get("message_type"));
        String peer;
        if ("group".equals(msgType)) {
            peer = str(msg.get("group_id"));
        } else {
            peer = str(msg.get("user_id"));
        }
        if (peer == null) return;

        String finalPeer = peer;
        String finalMsgType = msgType;

        if (raw.startsWith("!ping")) {
            long uptime = (System.currentTimeMillis() - startTime) / 1000;
            String text = "pong! 运行时间: " + uptime + "s";
            // 使用 Model API 发送纯文本
            ctx.getActions().sendMsgTyped(finalMsgType, finalPeer, Message.ofText(text))
                    .thenAccept((SendMsgResult r) -> ctx.getLogger().info("已回复: {} (msgId={})", text, r.messageId))
                    .exceptionally(ex -> {
                        ctx.getLogger().error("回复失败", ex);
                        return null;
                    });

        } else if (raw.startsWith("!java")) {
            String text = String.format(
                    "Java 信息\n  版本: %s\n  运行时: %s\n  可用内存: %.1f MB",
                    System.getProperty("java.version"),
                    System.getProperty("java.vm.name"),
                    Runtime.getRuntime().freeMemory() / 1024.0 / 1024.0
            );
            ctx.getActions().sendMsgTyped(finalMsgType, finalPeer, Message.ofText(text))
                    .thenAccept(r -> ctx.getLogger().info("已回复 JVM 信息"))
                    .exceptionally(ex -> {
                        ctx.getLogger().error("回复失败", ex);
                        return null;
                    });

        } else if (raw.startsWith("!image")) {
            // 使用消息构建器发送图片 + 文字
            List<MessageSegment> message = Message.builder()
                    .image("https://www.example.com/logo.png")
                    .text("这是一张图片")
                    .build();
            ctx.getActions().sendMsgTyped(finalMsgType, finalPeer, message)
                    .thenAccept(r -> ctx.getLogger().info("已发送图片，msgId={}", r.messageId))
                    .exceptionally(ex -> {
                        ctx.getLogger().error("发送图片失败", ex);
                        return null;
                    });

        } else if (raw.contains("@") && selfId != null && raw.contains(selfId)) {
            // 被 @时回复，使用构建器组合 @ + 文本
            List<MessageSegment> message = Message.builder()
                    .at(selfId)
                    .text(" 你好呀~")
                    .build();
            ctx.getActions().sendMsgTyped(finalMsgType, finalPeer, message)
                    .exceptionally(ex -> {
                        ctx.getLogger().error("回复失败", ex);
                        return null;
                    });

        } else if (raw.startsWith("!groupinfo") && "group".equals(finalMsgType)) {
            // 查询群信息（强类型）
            ctx.getActions().getGroupInfoTyped(finalPeer)
                    .thenAccept(info -> {
                        List<MessageSegment> reply = Message.ofText(String.format(
                                "群信息\n  群号: %d\n  群名: %s\n  成员数: %d",
                                info.groupId, info.groupName, info.memberCount
                        ));
                        ctx.getActions().sendMsgTyped(finalMsgType, finalPeer, reply);
                    })
                    .exceptionally(ex -> {
                        ctx.getLogger().error("获取群信息失败", ex);
                        return null;
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
