import { NCoreInitShell } from "@/shell/base";

export * from "@/framework/napcat";
export * from "@/shell/base";
if ((global as any).LiteLoader == undefined) {
    NCoreInitShell();
}