package com.napcat.jni.model.result;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 登录号信息（get_login_info 返回）
 */
public class LoginInfo {
    @JsonProperty("user_id")
    public long userId;
    public String nickname;

    public long getUserId() { return userId; }
    public String getNickname() { return nickname; }

    @Override
    public String toString() {
        return "LoginInfo{userId=" + userId + ", nickname='" + nickname + "'}";
    }
}
