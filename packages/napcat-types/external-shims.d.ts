// 外部模块 shim，提供最小的可运行值和类型，避免类型包依赖外部环境
// node:* 模块移除 mock，使用系统自带类型

// (ws/express/winston) now provided by real type deps (@types/ws, @types/express, winston)

declare module 'ffmpeg-static' {
  const _ffmpeg_static_default: any;
  export default _ffmpeg_static_default;
}

declare module 'fluent-ffmpeg' {
  const _fluent_ffmpeg_default: any;
  export default _fluent_ffmpeg_default;
}

declare module 'sharp' {
  const _sharp_default: any;
  export default _sharp_default;
}

declare module 'uuid' {
  export function v4 (...args: any[]): string;
}

declare module 'axios' {
  const _axios_default: any;
  export default _axios_default;
}

declare module 'body-parser' {
  const _body_parser_default: any;
  export default _body_parser_default;
}

declare module 'cors' {
  const _cors_default: any;
  export default _cors_default;
}

declare module 'file-type' {
  export function fileTypeFromFile (path: string): Promise<any>;
}

declare module 'image-size' {
  const _image_size_default: any;
  export default _image_size_default;
}

declare module 'jimp' {
  const _jimp_default: any;
  export default _jimp_default;
}

declare module 'qrcode' {
  const _qrcode_default: any;
  export default _qrcode_default;
}

declare module 'yaml' {
  export const parse: (...args: any[]) => any;
  export const stringify: (...args: any[]) => any;
}

declare module 'async-mutex' {
  export class Mutex {
    acquire (): Promise<() => void>;
    runExclusive<T> (callback: () => T | Promise<T>): Promise<T>;
  }
  export class Semaphore {
    acquire (): Promise<[() => void, number]>;
    runExclusive<T> (callback: () => T | Promise<T>): Promise<T>;
    release (): void;
  }
  const _async_mutex_default: { Mutex: typeof Mutex; Semaphore: typeof Semaphore; };
  export default _async_mutex_default;
}

declare module 'napcat-protobuf' {
  export class NapProtoMsg<T = any> {
    constructor (schema: any);
    decode (buffer: any): T;
    encode (value: any): Uint8Array;
  }
  export function ProtoField (...args: any[]): any;
  export type NapProtoEncodeStructType<T> = any;
  export type NapProtoDecodeStructType<T> = any;
  export type ScalarProtoFieldType<T> = any;
  export type MessageProtoFieldType<T> = any;
  export const ScalarType: {
    STRING: any;
    INT64: any;
    INT32: any;
    UINT32: any;
    UINT64: any;
    BYTES: any;
    BOOL: any;
    [key: string]: any;
  };
}

declare module 'inversify' {
  export class Container {
    bind: (...args: any[]) => any;
    get: <T = any>(id: any) => T;
  }
  export function injectable (...args: any[]): any;
  export function inject (...args: any[]): any;
  export interface ServiceIdentifier<T = any> { }
  const _inversify_default: any;
  export default _inversify_default;
}

declare module 'ajv' {
  export interface AnySchema { [key: string]: any; }

  export interface ErrorObject {
    keyword: string;
    instancePath: string;
    schemaPath: string;
    params: any;
    message?: string;
  }

  export interface ValidateFunction<T = any> {
    (data: any): data is T;
    errors: ErrorObject[] | null;
  }

  class Ajv {
    constructor (...args: any[]);
    compile<T = any> (schema: any): ValidateFunction<T>;
    validate (schemaOrRef: any, data: any): boolean;
    errorsText (errors?: any, options?: any): string;
    errors: ErrorObject[] | null;
  }

  export default Ajv;
  export { Ajv, ValidateFunction, ErrorObject };
}

declare module 'ip' {
  export function toBuffer (ip: any, buffer?: Buffer, offset?: number): Buffer;
  export function toString (buffer: any, offset?: number, length?: number): string;
  const _ip_default: any;
  export default _ip_default;
}
