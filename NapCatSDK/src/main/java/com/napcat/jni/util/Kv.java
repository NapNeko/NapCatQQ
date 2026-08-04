package com.napcat.jni.util;

import java.util.*;

/**
 * Java 8 兼容的集合工厂工具类（替代 Java 9+ 的 Map.of / List.of）
 * <p>
 * 方法语义与 {@code Map.of(...)} / {@code List.of(...)} 一致，但返回的是：
 * <ul>
 *   <li>单元素：使用 {@link Collections#singletonMap} / {@link Collections#singletonList}（不可变）</li>
 *   <li>多元素：使用 {@link LinkedHashMap} / {@link ArrayList}（可变，保留插入顺序）</li>
 * </ul>
 * <p>
 * 注意：本类所有方法都不接受 null key/value（与 Java 9+ of() 行为一致）。
 */
public final class Kv {

    private Kv() {
    }

    // ==================== Map ====================

    /** 空 Map */
    public static <K, V> Map<K, V> map() {
        return Collections.emptyMap();
    }

    /** 1 对键值 */
    public static <K, V> Map<K, V> map(K k1, V v1) {
        return Collections.singletonMap(k1, v1);
    }

    /** 2 对键值 */
    public static <K, V> Map<K, V> map(K k1, V v1, K k2, V v2) {
        Map<K, V> m = new LinkedHashMap<>(4);
        m.put(k1, v1);
        m.put(k2, v2);
        return m;
    }

    /** 3 对键值 */
    public static <K, V> Map<K, V> map(K k1, V v1, K k2, V v2, K k3, V v3) {
        Map<K, V> m = new LinkedHashMap<>(8);
        m.put(k1, v1);
        m.put(k2, v2);
        m.put(k3, v3);
        return m;
    }

    /** 4 对键值 */
    public static <K, V> Map<K, V> map(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4) {
        Map<K, V> m = new LinkedHashMap<>(8);
        m.put(k1, v1);
        m.put(k2, v2);
        m.put(k3, v3);
        m.put(k4, v4);
        return m;
    }

    /** 5 对键值 */
    public static <K, V> Map<K, V> map(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5) {
        Map<K, V> m = new LinkedHashMap<>(16);
        m.put(k1, v1);
        m.put(k2, v2);
        m.put(k3, v3);
        m.put(k4, v4);
        m.put(k5, v5);
        return m;
    }

    /** 6 对键值 */
    public static <K, V> Map<K, V> map(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5, K k6, V v6) {
        Map<K, V> m = new LinkedHashMap<>(16);
        m.put(k1, v1);
        m.put(k2, v2);
        m.put(k3, v3);
        m.put(k4, v4);
        m.put(k5, v5);
        m.put(k6, v6);
        return m;
    }

    /** 可变 Map（Java 8 兼容的 LinkedHashMap 工厂） */
    @SafeVarargs
    public static <K, V> Map<K, V> mutableMap(Object... kvs) {
        if (kvs == null || kvs.length == 0) {
            return new LinkedHashMap<>();
        }
        if ((kvs.length & 1) != 0) {
            throw new IllegalArgumentException("mutableMap requires even number of arguments (key, value pairs)");
        }
        Map<K, V> m = new LinkedHashMap<>(kvs.length);
        for (int i = 0; i < kvs.length; i += 2) {
            @SuppressWarnings("unchecked")
            K k = (K) kvs[i];
            @SuppressWarnings("unchecked")
            V v = (V) kvs[i + 1];
            m.put(k, v);
        }
        return m;
    }

    // ==================== List ====================

    /** 空 List */
    public static <T> List<T> list() {
        return Collections.emptyList();
    }

    /** 单元素 List */
    public static <T> List<T> list(T e1) {
        return Collections.singletonList(e1);
    }

    /** 2 元素 List */
    @SafeVarargs
    public static <T> List<T> list(T... elements) {
        if (elements == null || elements.length == 0) {
            return Collections.emptyList();
        }
        if (elements.length == 1) {
            return Collections.singletonList(elements[0]);
        }
        return new ArrayList<>(Arrays.asList(elements));
    }

    /**
     * Java 8 兼容的 ArrayList 工厂
     * <p>
     * 注意：与 {@code Arrays.asList} 不同，返回的列表是可变的（支持 add/remove）。
     */
    @SafeVarargs
    public static <T> ArrayList<T> arrayList(T... elements) {
        if (elements == null) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(elements));
    }
}
