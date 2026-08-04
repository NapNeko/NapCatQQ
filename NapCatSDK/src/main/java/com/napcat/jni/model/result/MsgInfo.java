package com.napcat.jni.model.result;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 消息信息（get_msg 返回）
 */
public class MsgInfo {
    public long time;
    @JsonProperty("message_type")
    public String messageType;
    @JsonProperty("message_id")
    public long messageId;
    @JsonProperty("real_id")
    public long realId;
    @JsonProperty("message_seq")
    public long messageSeq;
    /** 发送者信息 */
    public Sender sender;
    /** 消息内容（消息段数组） */
    public Object message;
    @JsonProperty("raw_message")
    public String rawMessage;
    public int font;
    @JsonProperty("group_id")
    public Long groupId;
    @JsonProperty("user_id")
    public long userId;

    /** 发送者信息 */
    public static class Sender {
        @JsonProperty("user_id")
        public long userId;
        public String nickname;
        public String card;
        /** 性别：male / female / unknown */
        public String sex;
        public int age;
        /** 群内角色：owner / admin / member */
        public String area;
        public String level;
        public String role;
        public String title;
    }

    @Override
    public String toString() {
        return "MsgInfo{messageId=" + messageId + ", userId=" + userId
                + ", messageType='" + messageType + "', rawMessage='" + rawMessage + "'}";
    }
}
