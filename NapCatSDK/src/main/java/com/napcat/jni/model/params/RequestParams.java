package com.napcat.jni.model.params;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 好友 / 群请求处理相关参数 Model
 */
public final class RequestParams {

    private RequestParams() {
    }

    /** 处理加好友请求参数 */
    public static class FriendAdd {
        /** 请求 flag（从上报事件中获取） */
        public String flag;
        /** 是否同意 */
        public boolean approve;
        /** 添加后的好友备注 */
        public String remark;

        public FriendAdd() {
        }

        public FriendAdd(String flag, boolean approve, String remark) {
            this.flag = flag;
            this.approve = approve;
            this.remark = remark;
        }
    }

    /** 处理加群请求/邀请参数 */
    public static class GroupAdd {
        /** 请求 flag（从上报事件中获取） */
        public String flag;
        /** 是否同意 */
        public boolean approve;
        /** 拒绝理由（approve=false 时有效） */
        public String reason;

        public GroupAdd() {
        }

        public GroupAdd(String flag, boolean approve, String reason) {
            this.flag = flag;
            this.approve = approve;
            this.reason = reason;
        }
    }
}
