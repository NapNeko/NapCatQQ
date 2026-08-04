package com.napcat.jni.protocol;

/**
 * 通用请求/通知参数和结果类型
 */
public final class ProtocolTypes {

    private ProtocolTypes() {
    }

    /** Node.js → Java init 请求参数 */
    public static class InitParams {
        public String dataPath;
        public String javaPluginPath;
        public String adapterName;
        public String javaPath;
        public String[] jvmArgs = new String[0];
        public String bridgeJar;
        public String[] classpath = new String[0];
    }

    /** init 请求响应 */
    public static class InitResult {
        public String version = "1.0.0";
        public JavaPluginInfo[] plugins = new JavaPluginInfo[0];

        public InitResult() {
        }

        public InitResult(String version, JavaPluginInfo[] plugins) {
            if (version != null) this.version = version;
            if (plugins != null) this.plugins = plugins;
        }
    }

    /** Java 插件元信息 */
    public static class JavaPluginInfo {
        public String id;
        public String name;
        public String version;
        public String description;
        public String author;
        public String entry;
        public boolean enabled;

        public JavaPluginInfo() {
        }

        public JavaPluginInfo(String id, String name, String version, String description,
                              String author, String entry, boolean enabled) {
            this.id = id;
            this.name = name;
            this.version = version;
            this.description = description;
            this.author = author;
            this.entry = entry;
            this.enabled = enabled;
        }
    }

    /** onMessage / onEvent 通知参数 */
    public static class EventParams {
        public Object event;
    }

    /** loadPlugin / unloadPlugin 请求参数 */
    public static class PluginOperationParams {
        public String pluginId;
    }

    // ==================== Java → Node.js 通知参数 ====================

    /** Java → Node 日志通知参数 */
    public static class LogNotificationParams {
        public String level;
        public String message;
        public Object[] args;

        public LogNotificationParams() {
        }

        public LogNotificationParams(String level, String message, Object[] args) {
            this.level = level;
            this.message = message;
            this.args = args;
        }
    }

    /** Java → Node Action 调用请求参数 */
    public static class CallActionNotificationParams {
        public Object requestId;
        public String action;
        public Object params;

        public CallActionNotificationParams() {
        }

        public CallActionNotificationParams(Object requestId, String action, Object params) {
            this.requestId = requestId;
            this.action = action;
            this.params = params;
        }
    }

    /** Node → Java Action 结果通知参数（回传） */
    public static class CallActionResultParams {
        public Object requestId;
        public boolean ok;
        public Object data;
        public String error;
    }

    /** Java → Node 自定义事件推送 */
    public static class EmitEventNotificationParams {
        public Object event;

        public EmitEventNotificationParams() {
        }

        public EmitEventNotificationParams(Object event) {
            this.event = event;
        }
    }
}
