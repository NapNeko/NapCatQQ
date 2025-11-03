class Store {
  private store = new Map<string, any>();

  set<T> (key: string, value: T, ttl?: number): void {
    this.store.set(key, value);
    if (ttl) {
      setTimeout(() => this.store.delete(key), ttl * 1000);
    }
  }

  get<T> (key: string): T | null {
    return this.store.get(key) ?? null;
  }

  exists (...keys: string[]): number {
    return keys.filter(key => this.store.has(key)).length;
  }
}

const store = new Store();

export default store;