import { NCoreInitShell } from "@/shell/base";
export * from "@/framework/napcat";
export * from "@/shell/base";
if (global.LiteLoader == undefined) {
    NCoreInitShell();
}