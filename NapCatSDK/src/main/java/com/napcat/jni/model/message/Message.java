package com.napcat.jni.model.message;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 消息构建器
 * <p>
 * 链式 API 构建复杂消息，内部封装 {@link MessageSegment} 列表。
 * <p>
 * 示例：
 * <pre>{@code
 *   // 纯文本
 *   List<MessageSegment> msg1 = Message.text("你好");
 *
 *   // @某人 + 文本
 *   List<MessageSegment> msg2 = Message.builder()
 *       .at("123456")
 *       .text(" 欢迎入群")
 *       .build();
 *
 *   // 回复 + 图片 + 文本
 *   List<MessageSegment> msg3 = Message.builder()
 *       .reply("10001")
 *       .image("https://example.com/a.png")
 *       .text("这是图片说明")
 *       .build();
 *
 *   // 直接使用 MessageSegment 静态方法
 *   List<MessageSegment> msg4 = List.of(
 *       MessageSegment.at("123456"),
 *       MessageSegment.text(" hello")
 *   );
 * }</pre>
 */
public class Message {

    private final List<MessageSegment> segments = new ArrayList<>();

    private Message() {
    }

    // ==================== 工厂方法 ====================

    /** 创建空消息构建器 */
    public static Message builder() {
        return new Message();
    }

    /** 将已有消息段包装为构建器 */
    public static Message builder(MessageSegment... segments) {
        Message m = new Message();
        if (segments != null) {
            m.segments.addAll(Arrays.asList(segments));
        }
        return m;
    }

    /**
     * 快捷方式：纯文本消息
     * <p>
     * 等价于 {@code List.of(MessageSegment.text(text))}
     */
    public static List<MessageSegment> ofText(String text) {
        return Collections.singletonList(MessageSegment.text(text));
    }

    /** 快捷方式：@某人消息 */
    public static List<MessageSegment> ofAt(String userId) {
        return Collections.singletonList(MessageSegment.at(userId));
    }

    /** 快捷方式：@全体成员消息 */
    public static List<MessageSegment> ofAtAll() {
        return Collections.singletonList(MessageSegment.atAll());
    }

    /** 快捷方式：图片消息 */
    public static List<MessageSegment> ofImage(String file) {
        return Collections.singletonList(MessageSegment.image(file));
    }

    // ==================== 链式方法 ====================

    /** 添加文本段 */
    public Message text(String text) {
        segments.add(MessageSegment.text(text));
        return this;
    }

    /** 添加 @段 */
    public Message at(String userId) {
        segments.add(MessageSegment.at(userId));
        return this;
    }

    /** 添加 @全体成员段 */
    public Message atAll() {
        segments.add(MessageSegment.atAll());
        return this;
    }

    /** 添加表情段 */
    public Message face(String id) {
        segments.add(MessageSegment.face(id));
        return this;
    }

    /** 添加回复段 */
    public Message reply(String messageId) {
        segments.add(MessageSegment.reply(messageId));
        return this;
    }

    /** 添加图片段 */
    public Message image(String file) {
        segments.add(MessageSegment.image(file));
        return this;
    }

    /** 添加图片段（含摘要/子类型） */
    public Message image(String file, String summary, int subType) {
        segments.add(MessageSegment.image(file, summary, subType));
        return this;
    }

    /** 添加语音段 */
    public Message record(String file) {
        segments.add(MessageSegment.record(file));
        return this;
    }

    /** 添加视频段 */
    public Message video(String file) {
        segments.add(MessageSegment.video(file));
        return this;
    }

    /** 添加文件段 */
    public Message file(String file) {
        segments.add(MessageSegment.file(file));
        return this;
    }

    /** 添加 JSON 消息段 */
    public Message json(String data) {
        segments.add(MessageSegment.json(data));
        return this;
    }

    /** 添加 XML 消息段 */
    public Message xml(String data) {
        segments.add(MessageSegment.xml(data));
        return this;
    }

    /** 添加戳一戳段 */
    public Message poke(String type, String id) {
        segments.add(MessageSegment.poke(type, id));
        return this;
    }

    /** 添加骰子段 */
    public Message dice(int result) {
        segments.add(MessageSegment.dice(result));
        return this;
    }

    /** 添加猜拳段 */
    public Message rps(int result) {
        segments.add(MessageSegment.rps(result));
        return this;
    }

    /** 添加位置段 */
    public Message location(double lat, double lon, String title) {
        segments.add(MessageSegment.location(lat, lon, title));
        return this;
    }

    /** 添加位置段（含内容） */
    public Message location(double lat, double lon, String title, String content) {
        segments.add(new MessageSegment("location", Map.of(
                "lat", lat, "lon", lon,
                "title", title == null ? "" : title,
                "content", content == null ? "" : content
        )));
        return this;
    }

    /** 添加推荐联系人/群段 */
    public Message contact(String type, String id) {
        segments.add(MessageSegment.contact(type, id));
        return this;
    }

    /** 添加音乐分享段 */
    public Message music(String type, String id) {
        segments.add(MessageSegment.music(type, id));
        return this;
    }

    /** 添加自定义音乐分享段 */
    public Message customMusic(String url, String audio, String title) {
        segments.add(MessageSegment.customMusic(url, audio, title));
        return this;
    }

    /** 添加 Markdown 消息段 */
    public Message markdown(String content) {
        segments.add(MessageSegment.markdown(content));
        return this;
    }

    /** 添加任意自定义消息段 */
    public Message segment(String type, Map<String, Object> data) {
        segments.add(new MessageSegment(type, data));
        return this;
    }

    /** 直接添加一个消息段 */
    public Message append(MessageSegment segment) {
        if (segment != null) {
            segments.add(segment);
        }
        return this;
    }

    /** 追加另一个消息构建器的全部内容 */
    public Message append(Message other) {
        if (other != null) {
            segments.addAll(other.segments);
        }
        return this;
    }

    // ==================== 输出 ====================

    /** 构建消息段列表 */
    public List<MessageSegment> build() {
        return new ArrayList<>(segments);
    }

    /** 当前段数 */
    public int size() {
        return segments.size();
    }

    /** 是否为空 */
    public boolean isEmpty() {
        return segments.isEmpty();
    }
}
