import { NCoreInitShell } from "@/shell/base";
export * from "@/framework/napcat";
export * from "@/shell/base";

interface LiteLoaderGlobal extends Global {
    LiteLoader?: unknown;
}

declare const global: LiteLoaderGlobal;

if (global.LiteLoader === undefined) {
    NCoreInitShell();
}