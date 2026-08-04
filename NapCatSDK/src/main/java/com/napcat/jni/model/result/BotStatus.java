package com.napcat.jni.model.result;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 机器人运行状态（get_status 返回）
 */
public class BotStatus {
    @JsonProperty("online")
    public boolean online;
    public boolean good;
    /** 统计信息 */
    public Statistics statistics;

    public static class Statistics {
        @JsonProperty("packet_received")
        public long packetReceived;
        @JsonProperty("packet_sent")
        public long packetSent;
        @JsonProperty("packet_lost")
        public long packetLost;
        @JsonProperty("message_received")
        public long messageReceived;
        @JsonProperty("message_sent")
        public long messageSent;
        @JsonProperty("disconnect_times")
        public long disconnectTimes;
        @JsonProperty("lost_times")
        public long lostTimes;
    }

    @Override
    public String toString() {
        return "BotStatus{online=" + online + ", good=" + good + "}";
    }
}
