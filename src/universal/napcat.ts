import { NCoreInitShell } from '@/shell/base';
export * from '@/framework/napcat';
export * from '@/shell/base';

if ((global as unknown as { LiteLoader: unknown }).LiteLoader === undefined) {
    NCoreInitShell();
}