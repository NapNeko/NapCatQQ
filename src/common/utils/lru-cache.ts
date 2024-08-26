export class LRUCache<K, V> {
    private capacity: number;
    private cache: Map<K, V>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map<K, V>();
    }

    public get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Move the accessed key to the end to mark it as most recently used
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    public put(key: K, value: V): void {
        if (this.cache.has(key)) {
            // If the key already exists, move it to the end to mark it as most recently used
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            // If the cache is full, remove the least recently used key (the first one in the map)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}