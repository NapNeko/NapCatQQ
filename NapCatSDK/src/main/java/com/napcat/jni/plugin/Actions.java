package com.napcat.jni.plugin;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * OneBot Action 调用客户端
 * <p>
 * 所有 Action 调用均为异步，返回 {@link CompletableFuture}，
 * 超时后 Future 将抛 {@link java.util.concurrent.TimeoutException}。
 * <p>
 * 示例：
 * <pre>{@code
 *   CompletableFuture<Object> future = ctx.getActions().call("send_msg", Map.of(
 *       "message_type", "group",
 *       "group_id", "123456",
 *       "message", "Hello from Java"
 *   ));
 *   Object result = future.get(30, TimeUnit.SECONDS);
 * }</pre>
 */
public interface Actions {

    /** 调用 OneBot Action，默认 30 秒超时 */
    CompletableFuture<Object> call(String action, Object params);

    /** 调用 OneBot Action，自定义超时 */
    CompletableFuture<Object> call(String action, Object params, long timeout, TimeUnit unit);

    // ==================== 常用便捷封装（默认实现） ====================

    /** 发送私聊消息 */
    default CompletableFuture<Object> sendPrivateMessage(String userId, Object message) {
        return call("send_private_msg", Map.of(
                "user_id", userId,
                "message", message
        ));
    }

    /** 发送群聊消息 */
    default CompletableFuture<Object> sendGroupMessage(String groupId, Object message) {
        return call("send_group_msg", Map.of(
                "group_id", groupId,
                "message", message
        ));
    }

    /** 发送通用消息（自动根据 message_type 选择群/私） */
    default CompletableFuture<Object> sendMsg(String messageType, String peerId, Object message) {
        if ("group".equalsIgnoreCase(messageType)) {
            return call("send_msg", Map.of(
                    "message_type", "group",
                    "group_id", peerId,
                    "message", message
            ));
        }
        return call("send_msg", Map.of(
                "message_type", "private",
                "user_id", peerId,
                "message", message
        ));
    }

    /** 获取登录号信息 */
    default CompletableFuture<Object> getLoginInfo() {
        return call("get_login_info", null);
    }

    /** 获取版本信息 */
    default CompletableFuture<Object> getVersionInfo() {
        return call("get_version_info", null);
    }

    /** 获取好友列表 */
    default CompletableFuture<Object> getFriendList() {
        return call("get_friend_list", null);
    }

    /** 获取群列表 */
    default CompletableFuture<Object> getGroupList() {
        return call("get_group_list", null);
    }

    /** 获取群成员列表 */
    default CompletableFuture<Object> getGroupMemberList(String groupId) {
        return call("get_group_member_list", Map.of("group_id", groupId));
    }

    /** 撤回消息 */
    default CompletableFuture<Object> deleteMsg(int messageId) {
        return call("delete_msg", Map.of("message_id", messageId));
    }

    /** 获取消息 */
    default CompletableFuture<Object> getMsg(int messageId) {
        return call("get_msg", Map.of("message_id", messageId));
    }

    /** 构造文本消息段：[{"type":"text","data":{"text":"xxx"}}] */
    static List<Map<String, Object>> textSegments(String text) {
        return List.of(Map.of(
                "type", "text",
                "data", Map.of("text", text)
        ));
    }
}
