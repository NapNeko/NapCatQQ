package com.napcat.jni.model.result;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 群信息（get_group_info / get_group_list 返回）
 */
public class GroupInfo {
    @JsonProperty("group_id")
    public long groupId;
    @JsonProperty("group_name")
    public String groupName;
    /** 成员数 */
    @JsonProperty("member_count")
    public int memberCount;
    /** 最大成员数 */
    @JsonProperty("max_member_count")
    public int maxMemberCount;

    public long getGroupId() { return groupId; }
    public String getGroupName() { return groupName; }
    public int getMemberCount() { return memberCount; }
    public int getMaxMemberCount() { return maxMemberCount; }

    @Override
    public String toString() {
        return "GroupInfo{groupId=" + groupId + ", groupName='" + groupName + "'}";
    }
}
