import { NCoreInitShell } from 'napcat-shell/base';
export * from 'napcat-framework/napcat';
export * from 'napcat-shell/base';

if ((global as unknown as { LiteLoader: unknown }).LiteLoader === undefined) {
  NCoreInitShell();
}
