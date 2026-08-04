package com.napcat.jni.model.result;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 群成员信息（get_group_member_info / get_group_member_list 返回）
 */
public class GroupMemberInfo {
    @JsonProperty("group_id")
    public long groupId;
    @JsonProperty("user_id")
    public long userId;
    public String nickname;
    /** 群名片 */
    public String card;
    /** 性别：male / female / unknown */
    public String sex;
    public int age;
    /** 入群时间戳 */
    @JsonProperty("join_time")
    public long joinTime;
    /** 最后发言时间戳 */
    @JsonProperty("last_sent_time")
    public long lastSentTime;
    /** 成员等级 */
    public String level;
    /** 角色：owner / admin / member */
    public String role;
    /** 专属头衔 */
    public String title;
    /** 地区 */
    public String area;
    /** 头衔过期时间戳 */
    @JsonProperty("title_expire_time")
    public long titleExpireTime;
    /** 禁言截止时间戳 */
    @JsonProperty("shut_up_timestamp")
    public long shutUpTimestamp;
    /** 是否为机器人 */
    @JsonProperty("is_robot")
    public boolean robot;

    @Override
    public String toString() {
        return "GroupMemberInfo{groupId=" + groupId + ", userId=" + userId
                + ", nickname='" + nickname + "', card='" + card + "', role='" + role + "'}";
    }
}
