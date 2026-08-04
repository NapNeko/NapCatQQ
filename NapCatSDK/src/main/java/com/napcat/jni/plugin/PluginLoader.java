package com.napcat.jni.plugin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.napcat.jni.protocol.ProtocolTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.ServiceLoader;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.jar.JarFile;
import java.util.jar.Manifest;

/**
 * Java 插件加载器
 * <p>
 * 插件发现优先级：
 * <ol>
 *   <li>读取 jar 的 META-INF/napcat-plugin.properties：
 *       id, name, version, description, author, entry（实现 NapCatPlugin 的类名）
 *   </li>
 *   <li>若无属性文件，则使用 {@link ServiceLoader}（META-INF/services/com.napcat.jni.plugin.NapCatPlugin）</li>
 *   <li>加载 class 文件所在目录：若包直接放置在 java-plugin 目录下的文件夹中（含 classes）</li>
 * </ol>
 */
public class PluginLoader {

    private static final Logger LOG = LoggerFactory.getLogger(PluginLoader.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** META-INF/napcat-plugin.properties 字段 */
    public static final String MANIFEST_ID = "id";
    public static final String MANIFEST_NAME = "name";
    public static final String MANIFEST_VERSION = "version";
    public static final String MANIFEST_DESCRIPTION = "description";
    public static final String MANIFEST_AUTHOR = "author";
    public static final String MANIFEST_ENTRY = "entry";

    /** 插件目录 */
    private final File pluginDir;
    /** 插件类加载器：pluginId → ClassLoader */
    private final ConcurrentMap<String, ClassLoader> classLoaders = new ConcurrentHashMap<>();
    /** 已加载插件实例：pluginId → NapCatPlugin */
    private final ConcurrentMap<String, NapCatPlugin> loaded = new ConcurrentHashMap<>();
    /** 插件元信息：pluginId → info */
    private final ConcurrentMap<String, ProtocolTypes.JavaPluginInfo> infos = new ConcurrentHashMap<>();

    public PluginLoader(File pluginDir) {
        this.pluginDir = pluginDir;
    }

    public File getPluginDir() {
        return pluginDir;
    }

    // ==================== 扫描 & 发现 ====================

    /**
     * 扫描插件目录，收集所有 Java 插件元信息（不加载）。
     *
     * @return 插件列表
     */
    public List<ProtocolTypes.JavaPluginInfo> scan() {
        List<ProtocolTypes.JavaPluginInfo> result = new ArrayList<>();
        if (!pluginDir.isDirectory()) {
            LOG.warn("[PluginLoader] plugin dir not exist: {}", pluginDir);
            return result;
        }
        File[] entries = pluginDir.listFiles();
        if (entries == null) return result;
        for (File entry : entries) {
            try {
                if (entry.isFile() && entry.getName().toLowerCase().endsWith(".jar")) {
                    ProtocolTypes.JavaPluginInfo info = readJarManifest(entry);
                    if (info != null) {
                        infos.put(info.id, info);
                        result.add(info);
                    }
                } else if (entry.isDirectory()) {
                    ProtocolTypes.JavaPluginInfo info = readDirManifest(entry);
                    if (info != null) {
                        infos.put(info.id, info);
                        result.add(info);
                    }
                }
            } catch (Exception e) {
                LOG.warn("[PluginLoader] failed to scan: {}", entry, e);
            }
        }
        return result;
    }

    private ProtocolTypes.JavaPluginInfo readJarManifest(File jar) throws IOException {
        try (JarFile jf = new JarFile(jar)) {
            java.util.jar.Attributes attrs = null;
            Manifest mf = jf.getManifest();
            if (mf != null) attrs = mf.getMainAttributes();

            // 1) META-INF/napcat-plugin.properties
            java.util.jar.JarEntry propEntry = jf.getJarEntry("META-INF/napcat-plugin.properties");
            if (propEntry != null) {
                Properties prop = new Properties();
                try (var in = jf.getInputStream(propEntry)) {
                    prop.load(in);
                }
                return buildInfoFromProperties(prop, jar.getName());
            }
            // 2) manifest
            if (attrs != null) {
                String entry = attrs.getValue("NapCat-Plugin-Entry");
                String id = attrs.getValue("NapCat-Plugin-Id");
                if (entry != null) {
                    return new ProtocolTypes.JavaPluginInfo(
                            id != null ? id : jar.getName(),
                            attrs.getValue("NapCat-Plugin-Name"),
                            attrs.getValue("NapCat-Plugin-Version"),
                            attrs.getValue("NapCat-Plugin-Description"),
                            attrs.getValue("NapCat-Plugin-Author"),
                            entry,
                            true
                    );
                }
            }
            // 3) ServiceLoader
            java.util.jar.JarEntry svc = jf.getJarEntry("META-INF/services/" + NapCatPlugin.class.getName());
            if (svc != null) {
                try (var in = jf.getInputStream(svc)) {
                    String first = new String(in.readAllBytes()).split("\\s+")[0];
                    if (!first.isEmpty()) {
                        return new ProtocolTypes.JavaPluginInfo(
                                jar.getName(), jar.getName(), "1.0.0", "", "", first, true
                        );
                    }
                }
            }
            return null;
        }
    }

    private ProtocolTypes.JavaPluginInfo readDirManifest(File dir) throws IOException {
        File propFile = new File(dir, "META-INF/napcat-plugin.properties");
        if (propFile.isFile()) {
            Properties prop = new Properties();
            try (var in = Files.newInputStream(propFile.toPath())) {
                prop.load(in);
            }
            return buildInfoFromProperties(prop, dir.getName());
        }
        File services = new File(dir, "META-INF/services/" + NapCatPlugin.class.getName());
        if (services.isFile()) {
            String first = Files.readString(services.toPath()).split("\\s+")[0];
            if (!first.isEmpty()) {
                return new ProtocolTypes.JavaPluginInfo(
                        dir.getName(), dir.getName(), "1.0.0", "", "", first, true
                );
            }
        }
        return null;
    }

    private ProtocolTypes.JavaPluginInfo buildInfoFromProperties(Properties p, String fallbackId) {
        String id = p.getProperty(MANIFEST_ID, fallbackId);
        String name = p.getProperty(MANIFEST_NAME, id);
        String version = p.getProperty(MANIFEST_VERSION, "1.0.0");
        String description = p.getProperty(MANIFEST_DESCRIPTION, "");
        String author = p.getProperty(MANIFEST_AUTHOR, "");
        String entry = p.getProperty(MANIFEST_ENTRY);
        if (entry == null || entry.isEmpty()) return null;
        return new ProtocolTypes.JavaPluginInfo(id, name, version, description, author, entry, true);
    }

    // ==================== 加载 / 卸载 ====================

    /**
     * 加载指定插件
     */
    public NapCatPlugin load(String pluginId, NapCatPluginContext ctx) throws Exception {
        NapCatPlugin existing = loaded.get(pluginId);
        if (existing != null) return existing;

        ProtocolTypes.JavaPluginInfo info = infos.get(pluginId);
        if (info == null) throw new IllegalArgumentException("Plugin not found: " + pluginId);

        ClassLoader cl = createClassLoader(pluginId);
        Thread.currentThread().setContextClassLoader(cl);
        Class<?> cls = Class.forName(info.entry, true, cl);
        if (!NapCatPlugin.class.isAssignableFrom(cls)) {
            throw new ClassCastException("Entry class " + info.entry + " does not implement NapCatPlugin");
        }
        Object instance = cls.getDeclaredConstructor().newInstance();
        NapCatPlugin plugin = (NapCatPlugin) instance;
        plugin.onInit(ctx);
        loaded.put(pluginId, plugin);
        LOG.info("[PluginLoader] loaded plugin: {} ({})", pluginId, info.version);
        return plugin;
    }

    /**
     * 卸载指定插件
     */
    public boolean unload(String pluginId, NapCatPluginContext ctx) {
        NapCatPlugin plugin = loaded.remove(pluginId);
        if (plugin == null) return false;
        try {
            plugin.onCleanup(ctx);
        } catch (Exception e) {
            LOG.warn("[PluginLoader] cleanup failed for plugin: {}", pluginId, e);
        }
        ClassLoader cl = classLoaders.remove(pluginId);
        if (cl instanceof URLClassLoader) {
            try {
                ((URLClassLoader) cl).close();
            } catch (IOException ignore) {
            }
        }
        LOG.info("[PluginLoader] unloaded plugin: {}", pluginId);
        return true;
    }

    /**
     * 加载所有 enabled 的插件（由调用方决定启用状态）
     *
     * @param contextFactory 为每个插件创建上下文的回调
     */
    public Map<String, NapCatPlugin> loadAll(java.util.function.BiFunction<String, String, NapCatPluginContext> contextFactory) throws Exception {
        Map<String, NapCatPlugin> loadedPlugins = new LinkedHashMap<>();
        for (ProtocolTypes.JavaPluginInfo info : infos.values()) {
            if (!info.enabled) continue;
            try {
                NapCatPluginContext ctx = contextFactory.apply(info.id, new File(pluginDir, sanitize(info.id)).getAbsolutePath());
                NapCatPlugin plugin = load(info.id, ctx);
                loadedPlugins.put(info.id, plugin);
            } catch (Exception e) {
                LOG.error("[PluginLoader] failed to auto-load plugin {}", info.id, e);
            }
        }
        return loadedPlugins;
    }

    private ClassLoader createClassLoader(String pluginId) throws IOException {
        return classLoaders.computeIfAbsent(pluginId, id -> {
            try {
                Path pluginPath;
                // 优先找同名 jar
                File jarFile = new File(pluginDir, id + ".jar");
                if (jarFile.isFile()) {
                    pluginPath = jarFile.toPath();
                } else {
                    File dir = new File(pluginDir, id);
                    if (dir.isDirectory()) pluginPath = dir.toPath();
                    else {
                        File[] entries = pluginDir.listFiles();
                        if (entries != null) {
                            for (File f : entries) {
                                try {
                                    ProtocolTypes.JavaPluginInfo info = f.getName().toLowerCase().endsWith(".jar")
                                            ? readJarManifest(f) : readDirManifest(f);
                                    if (info != null && id.equals(info.id)) {
                                        pluginPath = f.toPath();
                                        break;
                                    }
                                } catch (IOException ignore) {
                                }
                            }
                        }
                        pluginPath = jarFile.toPath();
                    }
                }
                List<URL> urls = new ArrayList<>();
                urls.add(pluginPath.toUri().toURL());
                // 引入插件目录下的 lib 目录
                File libDir = new File(pluginPath.toFile().isDirectory()
                        ? pluginPath.toFile() : pluginDir, "lib");
                if (libDir.isDirectory()) {
                    File[] libs = libDir.listFiles((d, n) -> n.toLowerCase().endsWith(".jar"));
                    if (libs != null) {
                        for (File lib : libs) urls.add(lib.toURI().toURL());
                    }
                }
                return new URLClassLoader(urls.toArray(new URL[0]), this.getClass().getClassLoader());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public NapCatPlugin get(String pluginId) {
        return loaded.get(pluginId);
    }

    public Map<String, NapCatPlugin> getLoaded() {
        return Collections.unmodifiableMap(loaded);
    }

    public List<ProtocolTypes.JavaPluginInfo> getInfos() {
        return new ArrayList<>(infos.values());
    }

    private static String sanitize(String s) {
        return s.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    /** 辅助：从 JsonNode（OneBot 事件）转 Map */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> eventToMap(Object event) {
        if (event instanceof Map) return (Map<String, Object>) event;
        if (event instanceof JsonNode) return MAPPER.convertValue(event, Map.class);
        return MAPPER.convertValue(event, Map.class);
    }
}
