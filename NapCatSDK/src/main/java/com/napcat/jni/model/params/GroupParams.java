package com.napcat.jni.model.params;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 群操作相关参数 Model
 * <p>
 * 封装群禁言、踢人、名片、管理员等操作的参数，避免手动构建 JSON。
 */
public final class GroupParams {

    private GroupParams() {
    }

    /** 禁言成员参数 */
    public static class Ban {
        @JsonProperty("group_id")
        public String groupId;
        @JsonProperty("user_id")
        public String userId;
        /** 禁言时长（秒），0 表示解除禁言 */
        public long duration;

        public Ban() {
        }

        public Ban(String groupId, String userId, long duration) {
            this.groupId = groupId;
            this.userId = userId;
            this.duration = duration;
        }
    }

    /** 踢出成员参数 */
    public static class Kick {
        @JsonProperty("group_id")
        public String groupId;
        @JsonProperty("user_id")
        public String userId;
        @JsonProperty("reject_add_request")
        public boolean rejectAddRequest;

        public Kick() {
        }

        public Kick(String groupId, String userId, boolean rejectAddRequest) {
            this.groupId = groupId;
            this.userId = userId;
            this.rejectAddRequest = rejectAddRequest;
        }
    }

    /** 设置群名片参数 */
    public static class SetCard {
        @JsonProperty("group_id")
        public String groupId;
        @JsonProperty("user_id")
        public String userId;
        /** 群名片，空字符串表示删除名片 */
        public String card;

        public SetCard() {
        }

        public SetCard(String groupId, String userId, String card) {
            this.groupId = groupId;
            this.userId = userId;
            this.card = card;
        }
    }

    /** 设置管理员参数 */
    public static class SetAdmin {
        @JsonProperty("group_id")
        public String groupId;
        @JsonProperty("user_id")
        public String userId;
        /** true=设为管理员，false=取消管理员 */
        public boolean enable;

        public SetAdmin() {
        }

        public SetAdmin(String groupId, String userId, boolean enable) {
            this.groupId = groupId;
            this.userId = userId;
            this.enable = enable;
        }
    }

    /** 全员禁言参数 */
    public static class WholeBan {
        @JsonProperty("group_id")
        public String groupId;
        /** true=开启全员禁言，false=关闭 */
        public boolean enable;

        public WholeBan() {
        }

        public WholeBan(String groupId, boolean enable) {
            this.groupId = groupId;
            this.enable = enable;
        }
    }

    /** 设置群名参数 */
    public static class SetName {
        @JsonProperty("group_id")
        public String groupId;
        @JsonProperty("group_name")
        public String groupName;

        public SetName() {
        }

        public SetName(String groupId, String groupName) {
            this.groupId = groupId;
            this.groupName = groupName;
        }
    }

    /** 退群参数 */
    public static class Leave {
        @JsonProperty("group_id")
        public String groupId;
        @JsonProperty("is_dismiss")
        public boolean isDismiss;

        public Leave() {
        }

        public Leave(String groupId, boolean isDismiss) {
            this.groupId = groupId;
            this.isDismiss = isDismiss;
        }
    }

    /** 设置群专属头衔参数 */
    public static class SetSpecialTitle {
        @JsonProperty("group_id")
        public String groupId;
        @JsonProperty("user_id")
        public String userId;
        @JsonProperty("special_title")
        public String specialTitle;

        public SetSpecialTitle() {
        }

        public SetSpecialTitle(String groupId, String userId, String specialTitle) {
            this.groupId = groupId;
            this.userId = userId;
            this.specialTitle = specialTitle;
        }
    }

    /** 获取群成员信息参数 */
    public static class GetMemberInfo {
        @JsonProperty("group_id")
        public String groupId;
        @JsonProperty("user_id")
        public String userId;
        @JsonProperty("no_cache")
        public boolean noCache;

        public GetMemberInfo() {
        }

        public GetMemberInfo(String groupId, String userId, boolean noCache) {
            this.groupId = groupId;
            this.userId = userId;
            this.noCache = noCache;
        }
    }

    /** 群组踢人（批量）参数 */
    public static class KickMembers {
        @JsonProperty("group_id")
        public String groupId;
        @JsonProperty("user_list")
        public java.util.List<String> userList;
        @JsonProperty("reject_add_request")
        public boolean rejectAddRequest;

        public KickMembers() {
        }

        public KickMembers(String groupId, java.util.List<String> userList, boolean rejectAddRequest) {
            this.groupId = groupId;
            this.userList = userList;
            this.rejectAddRequest = rejectAddRequest;
        }
    }
}
