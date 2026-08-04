package com.napcat.jni.model.result;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 发送消息结果（send_msg / send_private_msg / send_group_msg 返回）
 */
public class SendMsgResult {
    @JsonProperty("message_id")
    public long messageId;
    /** 合并转发消息 res_id（可选） */
    public String resId;
    /** 合并转发 forward_id（可选） */
    @JsonProperty("forward_id")
    public String forwardId;

    public long getMessageId() { return messageId; }

    @Override
    public String toString() {
        return "SendMsgResult{messageId=" + messageId + "}";
    }
}
