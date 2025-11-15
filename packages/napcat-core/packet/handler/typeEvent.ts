import { EventEmitter } from 'node:events';

export class TypedEventEmitter<E extends Record<string, any>> {
  private emitter = new EventEmitter();

  on<K extends keyof E>(event: K, listener: (payload: E[K]) => void) {
    this.emitter.on(event as string, listener);
    return () => this.off(event, listener);
  }

  once<K extends keyof E>(event: K, listener: (payload: E[K]) => void) {
    this.emitter.once(event as string, listener);
  }

  off<K extends keyof E>(event: K, listener: (payload: E[K]) => void) {
    this.emitter.off(event as string, listener);
  }

  emit<K extends keyof E>(event: K, payload: E[K]) {
    this.emitter.emit(event as string, payload);
  }
}
