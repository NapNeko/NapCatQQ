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

type cache<T> = { [key: group_id]: { [key: user_id]: cacheNode<T> } };
class LRU<T> {
  private maxAge: number;
  private maxSize: number;
  private currentSize: number;
  private cache: cache<T>;
  private head: cacheNode<T> | null = null;
  private tail: cacheNode<T> | null = null;
  private onFuncs: ((node: cacheNode<T>) => void)[] = [];

  constructor(maxAge: number = 2e4, maxSize: number = 5e3) {
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
    this.onFuncs.forEach((func) => func(node));
    this.currentSize--;
  }

  public on(func: (node: cacheNode<T>) => void) {
    this.onFuncs.push(func);
  }

  private removeExpired() {
    const now = Date.now();
    let current = this.tail;
    const nodesToRemove: cacheNode<T>[] = [];
    let removedCount = 0;

    // 收集需要删除的节点
    while (current && now - current.timestamp > this.maxAge) {
      nodesToRemove.push(current);
      current = current.prev;
      removedCount++;
      if (removedCount >= 100) break;
    }

    // 更新链表指向
    if (nodesToRemove.length > 0) {
      const newTail = nodesToRemove[nodesToRemove.length - 1].prev;
      if (newTail) {
        newTail.next = null;
      } else {
        this.head = null;
      }
      this.tail = newTail;
    }

    nodesToRemove.forEach((node) => {
      node.prev = node.next = null;
      delete this.cache[node.groupId][node.userId];

      this.currentSize--;
      this.onFuncs.forEach((func) => func(node));
    });
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
}

export default LRU;
