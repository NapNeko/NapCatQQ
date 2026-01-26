/// <reference path="./external-shims.d.ts" />
// 聚合导出核心库的所有内容（包括枚举、类和类型）
export * from '../napcat-core/index';

// 聚合导出 OneBot 的所有内容
export * from '../napcat-onebot/index';

// Ensure the shims file exists next to the emitted JS as well.
export type { };
