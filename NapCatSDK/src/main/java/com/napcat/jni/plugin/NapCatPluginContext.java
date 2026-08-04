package com.napcat.jni.plugin;

import java.util.Map;

/**
 * NapCat Java 插件上下文
 * <p>
 * 提供插件运行所需的信息与能力，对应 Node 侧的 NapCatPluginContext。
 */
public interface NapCatPluginContext {

    /** 数据目录（持久化配置与文件） */
    String getDataPath();

    /** Java 插件目录（存放所有 Java 插件） */
    String getJavaPluginPath();

    /** 适配器名称 */
    String getAdapterName();

    /** 当前插件 ID */
    String getPluginId();

    /** 当前插件目录 */
    String getPluginPath();

    /** OneBot Action 客户端（调用 NapCat OneBot API） */
    Actions getActions();

    /** 插件日志 */
    PluginLogger getLogger();

    /** 推送自定义 OneBot 事件 */
    void emitEvent(Object event);

    /** 原始桥接实例（高级用法） */
    Object getRawBridge();
}
