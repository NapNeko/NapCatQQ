// 外部模块全部声明为 unknown，确保类型包不依赖外部环境
// node:* 模块移除 mock，使用系统自带类型

declare module 'ws' {
  export class WebSocket { }
  export class WebSocketServer { }
  const _ws_default: unknown;
  export default _ws_default;
}

declare module 'express' {
  export interface Request { }
  export interface Response { }
  export interface NextFunction { }
  export interface Express { }
  const _express_default: unknown;
  export default _express_default;
}

declare module 'winston' {
  export const Logger: unknown;
  export const format: unknown;
  export const transports: unknown;
  const _winston_default: unknown;
  export default _winston_default;
}

declare module 'ffmpeg-static' {
  const _ffmpeg_static_default: unknown;
  export default _ffmpeg_static_default;
}

declare module 'fluent-ffmpeg' {
  const _fluent_ffmpeg_default: unknown;
  export default _fluent_ffmpeg_default;
}

declare module 'sharp' {
  const _sharp_default: unknown;
  export default _sharp_default;
}

declare module 'uuid' {
  export const v4: unknown;
}

declare module 'axios' {
  const _axios_default: unknown;
  export default _axios_default;
}

declare module 'body-parser' {
  const _body_parser_default: unknown;
  export default _body_parser_default;
}

declare module 'cors' {
  const _cors_default: unknown;
  export default _cors_default;
}

declare module 'file-type' {
  export const fileTypeFromFile: unknown;
}

declare module 'image-size' {
  const _image_size_default: unknown;
  export default _image_size_default;
}

declare module 'jimp' {
  const _jimp_default: unknown;
  export default _jimp_default;
}

declare module 'qrcode' {
  const _qrcode_default: unknown;
  export default _qrcode_default;
}

declare module 'yaml' {
  export const parse: unknown;
  export const stringify: unknown;
}

declare module 'async-mutex' {
  const _async_mutex_default: unknown;
  export default _async_mutex_default;
  export interface Mutex { }
  export interface Semaphore { }
}

declare module '@sinclair/typebox' {
  export const Type: unknown;
  export type Static<T = any> = any;
  export interface TSchema { }
  export interface TObject<T = any> extends TSchema { }
  export interface TOptional<T = any> extends TSchema { }
  export interface TNumber extends TSchema { }
  export interface TString extends TSchema { }
  export interface TBoolean extends TSchema { }
  export interface TArray<T = any> extends TSchema { }
  export interface TUnion<T = any> extends TSchema { }
  export interface TLiteral<T = any> extends TSchema { }
  export interface TAny extends TSchema { }
  export interface TNull extends TSchema { }
  export interface TUndefined extends TSchema { }
  export interface TVoid extends TSchema { }
}

declare module 'napcat-protobuf' {
  export type NapProtoEncodeStructType<T> = unknown;
  export type NapProtoDecodeStructType<T> = unknown;
  export type ScalarProtoFieldType<T> = unknown;
  export type MessageProtoFieldType<T> = unknown;
  export type ScalarType = unknown;
}

declare module 'inversify' {
  const _inversify_default: unknown;
  export default _inversify_default;
  export interface Container { }
  export interface ServiceIdentifier<T> { }
}

declare module 'ajv' {
  const _ajv_default: unknown;
  export default _ajv_default;
  export interface AnySchema { }
}
