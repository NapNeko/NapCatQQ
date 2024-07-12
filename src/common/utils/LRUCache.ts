import { logError, logDebug } from "@/common/utils/log";

type group_id = number;
type user_id = number;

class cacheNode<T> {
  value: T;
  groupId: group_id;
  userId: user_id;
  prev: cacheNode<T> | null;
  next: cacheNode<T> | null;
  timestamp: number;

  constructor(groupId: group_id, userId: user_id, value: T) {
    this.groupId = groupId;
    this.userId = userId;
    this.value = value;
    this.prev = null;
    this.next = null;
    this.timestamp = Date.now();
  }
}

type cache<T, K = { [key: user_id]: cacheNode<T> }> = { [key: group_id]: K };
type removeObject<T> = cache<T, { userId: user_id, value: T }[]>
class LRU<T> {
  private maxAge: number;
  private maxSize: number;
  private currentSize: number;
  private cache: cache<T>;
  private head: cacheNode<T> | null = null;
  private tail: cacheNode<T> | null = null;
  private onFuncs: ((node: removeObject<T>) => void)[] = [];

  constructor(maxAge: number = 6e4 * 3, maxSize: number = 1e4) {
    this.maxAge = maxAge;
    this.maxSize = maxSize;
    this.cache = Object.create(null);
    this.currentSize = 0;

    if (maxSize == 0) return;
    setInterval(() => this.removeExpired(), this.maxAge);
  }

  // 移除LRU节点
  private removeLRUNode(node: cacheNode<T>) {
    logDebug(
      "removeLRUNode",
      node.groupId,
      node.userId,
      node.value,
      this.currentSize
    );
    node.prev = node.next = null;
    delete this.cache[node.groupId][node.userId];
    this.removeNode(node);
    this.onFuncs.forEach((func) => func({ [node.groupId]: [node] }));
    this.currentSize--;
  }

  public on(func: (node: removeObject<T>) => void) {
    this.onFuncs.push(func);
  }

  private removeExpired() {
    const now = Date.now();
    let current = this.tail;
    let totalNodeNum = 0;

    const removeObject: cache<T, { userId: user_id, value: T }[]> = {};

    while (current && now - current.timestamp > this.maxAge) {
      // 收集节点
      if (!removeObject[current.groupId]) removeObject[current.groupId] = [];
      removeObject[current.groupId].push({ userId: current.userId, value: current.value });
      // 删除LRU节点
      delete this.cache[current.groupId][current.userId]
      current = current.prev;
      totalNodeNum++;
      this.currentSize--
    }

    if (!totalNodeNum) return;

    // 跟新链表指向
    if (current) { current.next = null } else { this.head = null }
    this.tail = current

    this.onFuncs.forEach(func => func(removeObject))
  }

  private addNode(node: cacheNode<T>) {
    node.next = this.head;
    if (this.head) this.head.prev = node;
    if (!this.tail) this.tail = node;
    this.head = node;
  }

  private removeNode(node: cacheNode<T>) {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;
  }

  private moveToHead(node: cacheNode<T>) {
    if (this.head === node) return;

    this.removeNode(node);
    this.addNode(node);
    node.prev = null;
  }

  public set(groupId: group_id, userId: user_id, value: T) {
    if (!this.cache[groupId]) {
      this.cache[groupId] = Object.create(null);
    }

    const groupObject = this.cache[groupId];

    if (groupObject[userId]) {
      const node = groupObject[userId];
      node.value = value;
      node.timestamp = Date.now();
      this.moveToHead(node);
    } else {
      const node = new cacheNode(groupId, userId, value);
      groupObject[userId] = node;
      this.currentSize++;
      this.addNode(node);
      if (this.currentSize > this.maxSize) {
        const tail = this.tail!;
        this.removeLRUNode(tail);
      }
    }
  }
  public get(groupId: group_id): { userId: user_id; value: T }[];
  public get(groupId: group_id, userId: user_id): null | { userId: user_id; value: T };
  public get(groupId: group_id, userId?: user_id): any {
    const groupObject = this.cache[groupId];
    if (!groupObject) return userId === undefined ? [] : null;

    if (userId === undefined) {
      return Object.entries(groupObject).map(([userId, { value }]) => ({
        userId: Number(userId),
        value,
      }));
    }

    if (groupObject[userId]) {
      return { userId, value: groupObject[userId].value };
    }

    return null;

  }
}



export default LRU;
