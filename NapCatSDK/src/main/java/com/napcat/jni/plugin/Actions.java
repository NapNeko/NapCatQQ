package com.napcat.jni.plugin;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.napcat.jni.core.NapCatBridge;
import com.napcat.jni.model.message.Message;
import com.napcat.jni.model.message.MessageSegment;
import com.napcat.jni.model.params.FileParams;
import com.napcat.jni.model.params.GroupParams;
import com.napcat.jni.model.params.RequestParams;
import com.napcat.jni.model.result.*;
import com.napcat.jni.util.Kv;

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
 * 推荐使用 Model 化便捷方法（返回强类型结果），原始 call 方法保留用于高级场景：
 * <pre>{@code
 *   // 1. 推荐用法：使用 Model 便捷方法
 *   LoginInfo info = ctx.getActions().getLoginInfoTyped().get(10, TimeUnit.SECONDS);
 *
 *   // 2. 使用消息构建器
 *   SendMsgResult result = ctx.getActions()
 *       .sendPrivateMsgTyped("123456", Message.text("你好"))
 *       .get(10, TimeUnit.SECONDS);
 *
 *   // 3. 群操作
 *   ctx.getActions().banGroupMemberTyped("群号", "QQ号", 600).get();
 *   ctx.getActions().setGroupCardTyped("群号", "QQ号", "新名片").get();
 *
 *   // 4. 原始调用（高级用法）
 *   Object raw = ctx.getActions().call("get_login_info", null).get();
 * }</pre>
 */
public interface Actions {

    ObjectMapper MAPPER = NapCatBridge.MAPPER;

    // ==================== 原始调用 ====================

    /** 调用 OneBot Action，默认 30 秒超时 */
    CompletableFuture<Object> call(String action, Object params);

    /** 调用 OneBot Action，自定义超时 */
    CompletableFuture<Object> call(String action, Object params, long timeout, TimeUnit unit);

    // ==================== 消息发送（Model 化） ====================

    /**
     * 发送私聊消息（返回强类型结果）
     *
     * @param userId  目标 QQ 号
     * @param message 消息内容，使用 {@link Message} 构建
     */
    default CompletableFuture<SendMsgResult> sendPrivateMsgTyped(String userId, List<MessageSegment> message) {
        return call("send_private_msg", Kv.map(
                "user_id", userId,
                "message", message
        )).thenApply(obj -> MAPPER.convertValue(obj, SendMsgResult.class));
    }

    /**
     * 发送群聊消息（返回强类型结果）
     *
     * @param groupId 目标群号
     * @param message 消息内容，使用 {@link Message} 构建
     */
    default CompletableFuture<SendMsgResult> sendGroupMsgTyped(String groupId, List<MessageSegment> message) {
        return call("send_group_msg", Kv.map(
                "group_id", groupId,
                "message", message
        )).thenApply(obj -> MAPPER.convertValue(obj, SendMsgResult.class));
    }

    /**
     * 发送通用消息（返回强类型结果）
     *
     * @param messageType 消息类型：private / group
     * @param peerId      目标 ID（QQ 号或群号）
     * @param message     消息内容
     */
    default CompletableFuture<SendMsgResult> sendMsgTyped(String messageType, String peerId, List<MessageSegment> message) {
        if ("group".equalsIgnoreCase(messageType)) {
            return call("send_msg", Kv.map(
                    "message_type", "group",
                    "group_id", peerId,
                    "message", message
            )).thenApply(obj -> MAPPER.convertValue(obj, SendMsgResult.class));
        }
        return call("send_msg", Kv.map(
                "message_type", "private",
                "user_id", peerId,
                "message", message
        )).thenApply(obj -> MAPPER.convertValue(obj, SendMsgResult.class));
    }

    // ==================== 消息发送（便捷方法，返回 Object） ====================

    /** 发送私聊消息 */
    default CompletableFuture<Object> sendPrivateMessage(String userId, Object message) {
        return call("send_private_msg", Kv.map("user_id", userId, "message", message));
    }

    /** 发送群聊消息 */
    default CompletableFuture<Object> sendGroupMessage(String groupId, Object message) {
        return call("send_group_msg", Kv.map("group_id", groupId, "message", message));
    }

    /** 发送通用消息 */
    default CompletableFuture<Object> sendMsg(String messageType, String peerId, Object message) {
        if ("group".equalsIgnoreCase(messageType)) {
            return call("send_msg", Kv.map("message_type", "group", "group_id", peerId, "message", message));
        }
        return call("send_msg", Kv.map("message_type", "private", "user_id", peerId, "message", message));
    }

    /** 发送纯文本私聊消息 */
    default CompletableFuture<SendMsgResult> sendPrivateText(String userId, String text) {
        return sendPrivateMsgTyped(userId, Message.ofText(text));
    }

    /** 发送纯文本群聊消息 */
    default CompletableFuture<SendMsgResult> sendGroupText(String groupId, String text) {
        return sendGroupMsgTyped(groupId, Message.ofText(text));
    }

    // ==================== 消息操作 ====================

    /** 撤回消息 */
    default CompletableFuture<Object> deleteMsg(long messageId) {
        return call("delete_msg", Kv.map("message_id", messageId));
    }

    /** 撤回消息（字符串 ID） */
    default CompletableFuture<Object> deleteMsg(String messageId) {
        return call("delete_msg", Kv.map("message_id", messageId));
    }

    /** 获取消息（返回强类型） */
    default CompletableFuture<MsgInfo> getMsgTyped(long messageId) {
        return call("get_msg", Kv.map("message_id", messageId))
                .thenApply(obj -> MAPPER.convertValue(obj, MsgInfo.class));
    }

    /** 获取消息（返回强类型，字符串 ID） */
    default CompletableFuture<MsgInfo> getMsgTyped(String messageId) {
        return call("get_msg", Kv.map("message_id", messageId))
                .thenApply(obj -> MAPPER.convertValue(obj, MsgInfo.class));
    }

    /** 标记消息已读 */
    default CompletableFuture<Object> markMsgAsRead(long messageId) {
        return call("mark_msg_as_read", Kv.map("message_id", messageId));
    }

    /** 标记私聊消息已读 */
    default CompletableFuture<Object> markPrivateMsgAsRead(String userId) {
        return call("mark_private_msg_as_read", Kv.map("user_id", userId));
    }

    /** 标记群消息已读 */
    default CompletableFuture<Object> markGroupMsgAsRead(String groupId) {
        return call("mark_group_msg_as_read", Kv.map("group_id", groupId));
    }

    /** 标记所有消息已读 */
    default CompletableFuture<Object> markAllMsgAsRead() {
        return call("_mark_all_as_read", null);
    }

    /** 获取合并转发消息 */
    default CompletableFuture<Object> getForwardMsg(String id) {
        return call("get_forward_msg", Kv.map("id", id));
    }

    /** 发送合并转发消息（群） */
    default CompletableFuture<SendMsgResult> sendGroupForwardMsgTyped(String groupId, List<MessageSegment> nodes) {
        return call("send_group_forward_msg", Kv.map("group_id", groupId, "messages", nodes))
                .thenApply(obj -> MAPPER.convertValue(obj, SendMsgResult.class));
    }

    /** 发送合并转发消息（私聊） */
    default CompletableFuture<SendMsgResult> sendPrivateForwardMsgTyped(String userId, List<MessageSegment> nodes) {
        return call("send_private_forward_msg", Kv.map("user_id", userId, "messages", nodes))
                .thenApply(obj -> MAPPER.convertValue(obj, SendMsgResult.class));
    }

    // ==================== 群操作（Model 化） ====================

    /** 禁言群成员 */
    default CompletableFuture<Object> banGroupMemberTyped(String groupId, String userId, long durationSeconds) {
        return call("set_group_ban", new GroupParams.Ban(groupId, userId, durationSeconds));
    }

    /** 踢出群成员 */
    default CompletableFuture<Object> kickGroupMemberTyped(String groupId, String userId, boolean rejectAddRequest) {
        return call("set_group_kick", new GroupParams.Kick(groupId, userId, rejectAddRequest));
    }

    /** 设置群名片 */
    default CompletableFuture<Object> setGroupCardTyped(String groupId, String userId, String card) {
        return call("set_group_card", new GroupParams.SetCard(groupId, userId, card));
    }

    /** 设置群管理员 */
    default CompletableFuture<Object> setGroupAdminTyped(String groupId, String userId, boolean enable) {
        return call("set_group_admin", new GroupParams.SetAdmin(groupId, userId, enable));
    }

    /** 全员禁言 */
    default CompletableFuture<Object> setGroupWholeBanTyped(String groupId, boolean enable) {
        return call("set_group_whole_ban", new GroupParams.WholeBan(groupId, enable));
    }

    /** 设置群名 */
    default CompletableFuture<Object> setGroupNameTyped(String groupId, String groupName) {
        return call("set_group_name", new GroupParams.SetName(groupId, groupName));
    }

    /** 退群 */
    default CompletableFuture<Object> setGroupLeaveTyped(String groupId, boolean isDismiss) {
        return call("set_group_leave", new GroupParams.Leave(groupId, isDismiss));
    }

    /** 设置群专属头衔 */
    default CompletableFuture<Object> setGroupSpecialTitleTyped(String groupId, String userId, String title) {
        return call("set_group_special_title", new GroupParams.SetSpecialTitle(groupId, userId, title));
    }

    /** 群聊戳一戳 */
    default CompletableFuture<Object> groupPoke(String groupId, String userId) {
        return call("group_poke", Kv.map("group_id", groupId, "user_id", userId));
    }

    // ==================== 群信息查询（Model 化） ====================

    /** 获取群信息 */
    default CompletableFuture<GroupInfo> getGroupInfoTyped(String groupId) {
        return call("get_group_info", Kv.map("group_id", groupId))
                .thenApply(obj -> MAPPER.convertValue(obj, GroupInfo.class));
    }

    /** 获取群信息（不使用缓存） */
    default CompletableFuture<GroupInfo> getGroupInfoTyped(String groupId, boolean noCache) {
        return call("get_group_info", Kv.map("group_id", groupId, "no_cache", noCache))
                .thenApply(obj -> MAPPER.convertValue(obj, GroupInfo.class));
    }

    /** 获取群列表（返回强类型列表） */
    default CompletableFuture<List<GroupInfo>> getGroupListTyped() {
        return call("get_group_list", null)
                .thenApply(obj -> MAPPER.convertValue(obj, new TypeReference<List<GroupInfo>>() {}));
    }

    /** 获取群成员信息 */
    default CompletableFuture<GroupMemberInfo> getGroupMemberInfoTyped(String groupId, String userId) {
        return call("get_group_member_info", new GroupParams.GetMemberInfo(groupId, userId, false))
                .thenApply(obj -> MAPPER.convertValue(obj, GroupMemberInfo.class));
    }

    /** 获取群成员信息（不使用缓存） */
    default CompletableFuture<GroupMemberInfo> getGroupMemberInfoTyped(String groupId, String userId, boolean noCache) {
        return call("get_group_member_info", new GroupParams.GetMemberInfo(groupId, userId, noCache))
                .thenApply(obj -> MAPPER.convertValue(obj, GroupMemberInfo.class));
    }

    /** 获取群成员列表（返回强类型列表） */
    default CompletableFuture<List<GroupMemberInfo>> getGroupMemberListTyped(String groupId) {
        return call("get_group_member_list", Kv.map("group_id", groupId))
                .thenApply(obj -> MAPPER.convertValue(obj, new TypeReference<List<GroupMemberInfo>>() {}));
    }

    // ==================== 好友操作 ====================

    /** 获取好友列表（返回强类型列表） */
    default CompletableFuture<List<FriendInfo>> getFriendListTyped() {
        return call("get_friend_list", null)
                .thenApply(obj -> MAPPER.convertValue(obj, new TypeReference<List<FriendInfo>>() {}));
    }

    /** 发送好友赞（点赞） */
    default CompletableFuture<Object> sendLike(String userId, int times) {
        return call("send_like", Kv.map("user_id", userId, "times", times));
    }

    /** 私聊戳一戳 */
    default CompletableFuture<Object> friendPoke(String userId) {
        return call("friend_poke", Kv.map("user_id", userId));
    }

    /** 设置好友备注 */
    default CompletableFuture<Object> setFriendRemark(String userId, String remark) {
        return call("set_friend_remark", Kv.map("user_id", userId, "remark", remark));
    }

    // ==================== 请求处理（Model 化） ====================

    /** 处理加好友请求 */
    default CompletableFuture<Object> setFriendAddRequestTyped(String flag, boolean approve, String remark) {
        return call("set_friend_add_request", new RequestParams.FriendAdd(flag, approve, remark));
    }

    /** 处理加群请求/邀请 */
    default CompletableFuture<Object> setGroupAddRequestTyped(String flag, boolean approve, String reason) {
        return call("set_group_add_request", new RequestParams.GroupAdd(flag, approve, reason));
    }

    // ==================== 系统/状态查询 ====================

    /** 获取登录号信息（强类型） */
    default CompletableFuture<LoginInfo> getLoginInfoTyped() {
        return call("get_login_info", null)
                .thenApply(obj -> MAPPER.convertValue(obj, LoginInfo.class));
    }

    /** 获取版本信息（强类型） */
    default CompletableFuture<VersionInfo> getVersionInfoTyped() {
        return call("get_version_info", null)
                .thenApply(obj -> MAPPER.convertValue(obj, VersionInfo.class));
    }

    /** 获取运行状态（强类型） */
    default CompletableFuture<BotStatus> getStatusTyped() {
        return call("get_status", null)
                .thenApply(obj -> MAPPER.convertValue(obj, BotStatus.class));
    }

    /** 检查是否可以发送图片 */
    default CompletableFuture<Boolean> canSendImage() {
        return call("can_send_image", null)
                .thenApply(obj -> MAPPER.convertValue(obj, Map.class))
                .thenApply(m -> Boolean.TRUE.equals(((Map<?, ?>) m).get("yes")));
    }

    /** 检查是否可以发送语音 */
    default CompletableFuture<Boolean> canSendRecord() {
        return call("can_send_record", null)
                .thenApply(obj -> MAPPER.convertValue(obj, Map.class))
                .thenApply(m -> Boolean.TRUE.equals(((Map<?, ?>) m).get("yes")));
    }

    /** 获取 Cookies */
    default CompletableFuture<String> getCookies() {
        return call("get_cookies", null)
                .thenApply(obj -> MAPPER.convertValue(obj, Map.class))
                .thenApply(m -> (String) ((Map<?, ?>) m).get("cookies"));
    }

    /** 获取 CSRF Token */
    default CompletableFuture<Integer> getCsrfToken() {
        return call("get_csrf_token", null)
                .thenApply(obj -> MAPPER.convertValue(obj, Map.class))
                .thenApply(m -> (Integer) ((Map<?, ?>) m).get("token"));
    }

    // ==================== 文件操作（Model 化） ====================

    /** 获取图片信息 */
    default CompletableFuture<FileInfo> getImageTyped(String file) {
        return call("get_image", FileParams.GetFile.byPath(file))
                .thenApply(obj -> MAPPER.convertValue(obj, FileInfo.class));
    }

    /** 获取图片信息（通过 file_id） */
    default CompletableFuture<FileInfo> getImageByIdTyped(String fileId) {
        return call("get_image", FileParams.GetFile.byId(fileId))
                .thenApply(obj -> MAPPER.convertValue(obj, FileInfo.class));
    }

    /** 获取语音信息（含格式转换） */
    default CompletableFuture<FileInfo> getRecordTyped(String file, String outFormat) {
        return call("get_record", new FileParams.GetRecord(file, outFormat))
                .thenApply(obj -> MAPPER.convertValue(obj, FileInfo.class));
    }

    /** 获取文件信息 */
    default CompletableFuture<FileInfo> getFileTyped(String fileId) {
        return call("get_file", FileParams.GetFile.byId(fileId))
                .thenApply(obj -> MAPPER.convertValue(obj, FileInfo.class));
    }

    /** 上传群文件 */
    default CompletableFuture<Object> uploadGroupFileTyped(String groupId, String file, String name, String folder) {
        return call("upload_group_file", new FileParams.UploadGroupFile(groupId, file, name, folder));
    }

    /** 上传私聊文件 */
    default CompletableFuture<Object> uploadPrivateFileTyped(String userId, String file, String name) {
        return call("upload_private_file", new FileParams.UploadPrivateFile(userId, file, name));
    }

    // ==================== 表情回应 ====================

    /** 对消息发送表情回应 */
    default CompletableFuture<Object> setMsgEmojiLike(String messageId, String emojiId) {
        return call("set_msg_emoji_like", Kv.map("message_id", messageId, "emoji_id", emojiId));
    }

    // ==================== 旧版便捷方法（向后兼容） ====================

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
        return call("get_group_member_list", Kv.map("group_id", groupId));
    }

    /** 撤回消息 */
    default CompletableFuture<Object> deleteMsg(int messageId) {
        return call("delete_msg", Kv.map("message_id", messageId));
    }

    /** 获取消息 */
    default CompletableFuture<Object> getMsg(int messageId) {
        return call("get_msg", Kv.map("message_id", messageId));
    }

    /** 构造文本消息段 */
    static List<Map<String, Object>> textSegments(String text) {
        return Kv.list(Kv.map("type", "text", "data", Kv.map("text", text)));
    }
}
