export type StoreValueType = string | number | boolean | object | null;

export type StoreValue<T extends StoreValueType = StoreValueType> = {
    value: T;
    expiresAt?: number;
};

class Store {
    // 使用Map存储键值对
    private store: Map<string, StoreValue>;
    // 定时清理器
    private cleanerTimer: NodeJS.Timeout;
    // 用于分批次扫描的游标
    private scanCursor: number = 0;

    /**
     * Store
     * @param cleanInterval 清理间隔
     * @param scanLimit 扫描限制(每次最多检查的键数)
     */
    constructor(
        cleanInterval: number = 1000, // 默认1秒执行一次
        private scanLimit: number = 100 // 每次最多检查100个键
    ) {
        this.store = new Map();
        this.cleanerTimer = setInterval(() => this.cleanupExpired(), cleanInterval);
    }

    /**
     * 设置键值对
     * @param key 键
     * @param value 值
     * @param ttl 过期时间
     * @returns void
     * @example store.set('key', 'value', 60)
     */
    set<T extends StoreValueType>(key: string, value: T, ttl?: number): void {
        if (ttl && ttl <= 0) {
            this.del(key);
            return;
        }
        const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
        this.store.set(key, { value, expiresAt });
    }

    /**
     * 清理过期键
     */
    private cleanupExpired(): void {
        const now = Date.now();
        const keys = Array.from(this.store.keys());
        let scanned = 0;

        // 分批次扫描
        while (scanned < this.scanLimit && this.scanCursor < keys.length) {
            const key = keys[this.scanCursor++];
            const entry = this.store.get(key!)!;

            if (entry.expiresAt && entry.expiresAt < now) {
                this.store.delete(key!);
            }

            scanned++;
        }

        // 重置游标（环形扫描）
        if (this.scanCursor >= keys.length) {
            this.scanCursor = 0;
        }
    }

    /**
     * 获取键值
     * @param key 键
     * @returns T | null
     * @example store.get('key')
     */
    get<T extends StoreValueType>(key: string): T | null {
        this.checkKeyExpiry(key); // 每次访问都检查
        const entry = this.store.get(key);
        return entry ? (entry.value as T) : null;
    }

    /**
     * 检查键是否过期
     * @param key 键
     */
    private checkKeyExpiry(key: string): void {
        const entry = this.store.get(key);
        if (entry?.expiresAt && entry.expiresAt < Date.now()) {
            this.store.delete(key);
        }
    }

    /**
     * 检查键是否存在
     * @param keys 键
     * @returns number
     * @example store.exists('key1', 'key2')
     */
    exists(...keys: string[]): number {
        return keys.filter((key) => {
            this.checkKeyExpiry(key);
            return this.store.has(key);
        }).length;
    }

    /**
     * 关闭存储器
     */
    shutdown(): void {
        clearInterval(this.cleanerTimer);
        this.store.clear();
    }

    /**
     * 删除键
     * @param keys 键
     * @returns number
     * @example store.del('key1', 'key2')
     */
    del(...keys: string[]): number {
        return keys.reduce((count, key) => (this.store.delete(key) ? count + 1 : count), 0);
    }

    /**
     * 设置键的过期时间
     * @param key 键
     * @param seconds 过期时间(秒)
     * @returns boolean
     * @example store.expire('key', 60)
     */
    expire(key: string, seconds: number): boolean {
        const entry = this.store.get(key);
        if (!entry) return false;

        entry.expiresAt = Date.now() + seconds * 1000;
        return true;
    }

    /**
     * 获取键的过期时间
     * @param key 键
     * @returns number | null
     * @example store.ttl('key')
     */
    ttl(key: string): number | null {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (!entry.expiresAt) return -1;
        const remaining = entry.expiresAt - Date.now();
        return remaining > 0 ? Math.floor(remaining / 1000) : -2;
    }

    /**
     * 键值数字递增
     * @param key 键
     * @returns number
     * @example store.incr('key')
     */
    incr(key: string): number {
        const current = this.get<StoreValueType>(key);

        if (current === null) {
            this.set(key, 1, 60);
            return 1;
        }

        let numericValue: number;
        if (typeof current === 'number') {
            numericValue = current;
        } else if (typeof current === 'string') {
            if (!/^-?\d+$/.test(current)) {
                throw new Error('ERR value is not an integer');
            }
            numericValue = parseInt(current, 10);
        } else {
            throw new Error('ERR value is not an integer');
        }

        const newValue = numericValue + 1;
        this.set(key, newValue, 60);
        return newValue;
    }
}

const store = new Store();

export default store;
