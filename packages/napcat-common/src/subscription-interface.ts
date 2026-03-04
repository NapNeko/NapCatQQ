export type LogListener = (msg: string) => void;
export interface ISubscription {
  subscribe (listener: LogListener): void;
  unsubscribe (listener: LogListener): void;
  notify (msg: string): void;
}