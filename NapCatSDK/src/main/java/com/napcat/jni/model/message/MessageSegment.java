package com.napcat.jni.model.message;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * OneBot 11 消息段
 * <p>
 * OneBot 11 标准消息格式，每条消息由一个或多个消息段组成：
 * <pre>{@code
 *   { "type": "text", "data": { "text": "hello" } }
 * }</pre>
 * <p>
 * 使用静态工厂方法快速创建消息段：
 * <pre>{@code
 *   MessageSegment text = MessageSegment.text("你好");
 *   MessageSegment at = MessageSegment.at("123456");
 *   MessageSegment img = MessageSegment.image("https://example.com/a.png");
 * }</pre>
 * <p>
 * 或使用 {@link Message} 链式构建复杂消息。
 */
public class MessageSegment {

    private final String type;
    private final Map<String, Object> data;

    public MessageSegment(String type) {
        this.type = type;
        this.data = new LinkedHashMap<>();
    }

    public MessageSegment(String type, Map<String, Object> data) {
        this.type = type;
        this.data = data != null ? new LinkedHashMap<>(data) : new LinkedHashMap<>();
    }

    // ==================== 静态工厂方法 ====================

    /** 文本段 */
    public static MessageSegment text(String text) {
        return new MessageSegment("text", Map.of("text", text));
    }

    /** @某人段 */
    public static MessageSegment at(String userId) {
        return new MessageSegment("at", Map.of("qq", userId));
    }

    /** @全体成员段 */
    public static MessageSegment atAll() {
        return new MessageSegment("at", Map.of("qq", "all"));
    }

    /** 表情段 */
    public static MessageSegment face(String id) {
        return new MessageSegment("face", Map.of("id", id));
    }

    /** 回复段 */
    public static MessageSegment reply(String messageId) {
        return new MessageSegment("reply", Map.of("id", messageId));
    }

    /** 图片段（file 可为 URL / Base64 / 本地路径 / file_id） */
    public static MessageSegment image(String file) {
        return new MessageSegment("image", Map.of("file", file));
    }

    /** 图片段（含摘要/子类型） */
    public static MessageSegment image(String file, String summary, int subType) {
        return new MessageSegment("image", Map.of("file", file, "summary", summary, "sub_type", subType));
    }

    /** 语音段 */
    public static MessageSegment record(String file) {
        return new MessageSegment("record", Map.of("file", file));
    }

    /** 视频段 */
    public static MessageSegment video(String file) {
        return new MessageSegment("video", Map.of("file", file));
    }

    /** 文件段 */
    public static MessageSegment file(String file) {
        return new MessageSegment("file", Map.of("file", file));
    }

    /** JSON 消息段 */
    public static MessageSegment json(String data) {
        return new MessageSegment("json", Map.of("data", data));
    }

    /** XML 消息段 */
    public static MessageSegment xml(String data) {
        return new MessageSegment("xml", Map.of("data", data));
    }

    /** 戳一戳段 */
    public static MessageSegment poke(String type, String id) {
        return new MessageSegment("poke", Map.of("type", type, "id", id));
    }

    /** 骰子段 */
    public static MessageSegment dice(int result) {
        return new MessageSegment("dice", Map.of("result", result));
    }

    /** 猜拳段 */
    public static MessageSegment rps(int result) {
        return new MessageSegment("rps", Map.of("result", result));
    }

    /** 位置段 */
    public static MessageSegment location(double lat, double lon, String title) {
        return new MessageSegment("location", Map.of("lat", lat, "lon", lon, "title", title == null ? "" : title));
    }

    /** 推荐联系人/群段 */
    public static MessageSegment contact(String type, String id) {
        return new MessageSegment("contact", Map.of("type", type, "id", id));
    }

    /** 音乐分享段 */
    public static MessageSegment music(String type, String id) {
        return new MessageSegment("music", Map.of("type", type, "id", id));
    }

    /** 自定义音乐分享段 */
    public static MessageSegment customMusic(String url, String audio, String title) {
        return new MessageSegment("music", Map.of("type", "custom", "url", url, "audio", audio, "title", title));
    }

    /** Markdown 消息段 */
    public static MessageSegment markdown(String content) {
        return new MessageSegment("markdown", Map.of("content", content));
    }

    /** 合并转发节点（自定义内容） */
    public static MessageSegment forwardNode(String userId, String nickname, List<MessageSegment> content) {
        return new MessageSegment("node", Map.of("user_id", userId, "nickname", nickname, "content", content));
    }

    /** 合并转发节点（引用已有消息） */
    public static MessageSegment forwardNodeById(String messageId) {
        return new MessageSegment("node", Map.of("id", messageId));
    }

    /** 合并转发消息 */
    public static MessageSegment forward(String id) {
        return new MessageSegment("forward", Map.of("id", id));
    }

    // ==================== Getter ====================

    /** 消息段类型 */
    public String getType() {
        return type;
    }

    /** 消息段数据 */
    public Map<String, Object> getData() {
        return data;
    }

    /** 添加数据字段 */
    public MessageSegment put(String key, Object value) {
        this.data.put(key, value);
        return this;
    }

    @Override
    public String toString() {
        return "MessageSegment{type='" + type + "', data=" + data + "}";
    }
}
