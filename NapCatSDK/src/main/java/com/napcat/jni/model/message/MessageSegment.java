package com.napcat.jni.model.message;

import com.napcat.jni.util.Kv;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * OneBot 11 消息段（Java 8 兼容版本）
 * <p>
 * 使用静态工厂方法快速创建消息段：
 * <pre>{@code
 *   MessageSegment text = MessageSegment.text("你好");
 *   MessageSegment at = MessageSegment.at("123456");
 * }</pre>
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

    public static MessageSegment text(String text) {
        return new MessageSegment("text", Kv.map("text", text));
    }

    public static MessageSegment at(String userId) {
        return new MessageSegment("at", Kv.map("qq", userId));
    }

    public static MessageSegment atAll() {
        return new MessageSegment("at", Kv.map("qq", "all"));
    }

    public static MessageSegment face(String id) {
        return new MessageSegment("face", Kv.map("id", id));
    }

    public static MessageSegment reply(String messageId) {
        return new MessageSegment("reply", Kv.map("id", messageId));
    }

    public static MessageSegment image(String file) {
        return new MessageSegment("image", Kv.map("file", file));
    }

    public static MessageSegment image(String file, String summary, int subType) {
        return new MessageSegment("image", Kv.map("file", file, "summary", summary, "sub_type", subType));
    }

    public static MessageSegment record(String file) {
        return new MessageSegment("record", Kv.map("file", file));
    }

    public static MessageSegment video(String file) {
        return new MessageSegment("video", Kv.map("file", file));
    }

    public static MessageSegment file(String file) {
        return new MessageSegment("file", Kv.map("file", file));
    }

    public static MessageSegment json(String data) {
        return new MessageSegment("json", Kv.map("data", data));
    }

    public static MessageSegment xml(String data) {
        return new MessageSegment("xml", Kv.map("data", data));
    }

    public static MessageSegment poke(String type, String id) {
        return new MessageSegment("poke", Kv.map("type", type, "id", id));
    }

    public static MessageSegment dice(int result) {
        return new MessageSegment("dice", Kv.map("result", result));
    }

    public static MessageSegment rps(int result) {
        return new MessageSegment("rps", Kv.map("result", result));
    }

    public static MessageSegment location(double lat, double lon, String title) {
        return new MessageSegment("location", Kv.map("lat", lat, "lon", lon, "title", title == null ? "" : title));
    }

    public static MessageSegment contact(String type, String id) {
        return new MessageSegment("contact", Kv.map("type", type, "id", id));
    }

    public static MessageSegment music(String type, String id) {
        return new MessageSegment("music", Kv.map("type", type, "id", id));
    }

    public static MessageSegment customMusic(String url, String audio, String title) {
        return new MessageSegment("music", Kv.map("type", "custom", "url", url, "audio", audio, "title", title));
    }

    public static MessageSegment markdown(String content) {
        return new MessageSegment("markdown", Kv.map("content", content));
    }

    public static MessageSegment forwardNode(String userId, String nickname, List<MessageSegment> content) {
        return new MessageSegment("node", Kv.map("user_id", userId, "nickname", nickname, "content", content));
    }

    public static MessageSegment forwardNodeById(String messageId) {
        return new MessageSegment("node", Kv.map("id", messageId));
    }

    public static MessageSegment forward(String id) {
        return new MessageSegment("forward", Kv.map("id", id));
    }

    public String getType() { return type; }
    public Map<String, Object> getData() { return data; }

    public MessageSegment put(String key, Object value) {
        this.data.put(key, value);
        return this;
    }

    @Override
    public String toString() {
        return "MessageSegment{type='" + type + "', data=" + data + "}";
    }
}
