package com.napcat.jni.model.result;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 好友信息（get_friend_list 返回）
 */
public class FriendInfo {
    @JsonProperty("user_id")
    public long userId;
    public String nickname;
    public String remark;

    public long getUserId() { return userId; }
    public String getNickname() { return nickname; }
    public String getRemark() { return remark; }

    @Override
    public String toString() {
        return "FriendInfo{userId=" + userId + ", nickname='" + nickname + "', remark='" + remark + "'}";
    }
}
