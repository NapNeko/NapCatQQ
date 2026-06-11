import { EventEmitter } from 'events';
import type { InternalEventMap, InternalEventName, InternalEventPayload } from './types.js';

/**
 * Typed event bus for inter-module communication.
 * All modules must use this instead of calling each other directly.
 */
class TypedEventBus extends EventEmitter {
  constructor() {
    super();
    super.setMaxListeners(50);
  }

  emit<T extends InternalEventName>(event: T, payload: InternalEventPayload<T>): boolean {
    return super.emit(event, payload);
  }

  on<T extends InternalEventName>(
    event: T,
    listener: (payload: InternalEventPayload<T>) => void | Promise<void>
  ): this {
    return super.on(event, listener);
  }

  once<T extends InternalEventName>(
    event: T,
    listener: (payload: InternalEventPayload<T>) => void | Promise<void>
  ): this {
    return super.once(event, listener);
  }

  off<T extends InternalEventName>(
    event: T,
    listener: (payload: InternalEventPayload<T>) => void | Promise<void>
  ): this {
    return super.off(event, listener);
  }
}

export const bus = new TypedEventBus();
