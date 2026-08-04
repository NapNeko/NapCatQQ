package com.napcat.jni.model.result;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 版本信息（get_version_info 返回）
 */
public class VersionInfo {
    public String app_name;
    public String app_version;
    public String protocol_version;
    public String version;
    @JsonProperty("app_full_name")
    public String appFullName;
    public String cmd_version;

    public String getAppName() { return app_name; }
    public String getAppVersion() { return app_version; }

    @Override
    public String toString() {
        return "VersionInfo{app_name='" + app_name + "', app_version='" + app_version + "'}";
    }
}
