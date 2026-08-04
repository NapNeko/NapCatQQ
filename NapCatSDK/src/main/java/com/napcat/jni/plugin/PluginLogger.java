package com.napcat.jni.plugin;

/**
 * NapCat Java 插件日志接口
 */
public interface PluginLogger {

    void log(String message, Object... args);

    void debug(String message, Object... args);

    void info(String message, Object... args);

    void warn(String message, Object... args);

    void error(String message, Object... args);

    default void error(String message, Throwable t) {
        error(message + ": " + t.getMessage());
    }
}
