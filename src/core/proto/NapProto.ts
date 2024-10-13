import { MessageType, PartialMessage, RepeatType, ScalarType } from '@protobuf-ts/runtime';
import { PartialFieldInfo } from "@protobuf-ts/runtime/build/types/reflection-info";

type LowerCamelCase<S extends string> = CamelCaseHelper<S, false, true>;

type CamelCaseHelper<
    S extends string,
    CapNext extends boolean,
    IsFirstChar extends boolean
> = S extends `${infer F}${infer R}`
    ? F extends '_'
    ? CamelCaseHelper<R, true, false>
    : F extends `${number}`
    ? `${F}${CamelCaseHelper<R, true, false>}`
    : CapNext extends true
    ? `${Uppercase<F>}${CamelCaseHelper<R, false, false>}`
    : IsFirstChar extends true
    ? `${Lowercase<F>}${CamelCaseHelper<R, false, false>}`
    : `${F}${CamelCaseHelper<R, false, false>}`
    : '';

type ScalarTypeToTsType<T extends ScalarType> =
    T extends ScalarType.DOUBLE | ScalarType.FLOAT | ScalarType.INT32 | ScalarType.FIXED32 | ScalarType.UINT32 | ScalarType.SFIXED32 | ScalarType.SINT32 ? number :
    T extends ScalarType.INT64 | ScalarType.UINT64 | ScalarType.FIXED64 | ScalarType.SFIXED64 | ScalarType.SINT64 ? bigint :
    T extends ScalarType.BOOL ? boolean :
    T extends ScalarType.STRING ? string :
    T extends ScalarType.BYTES ? Uint8Array :
    never;

interface BaseProtoFieldType<T, O extends boolean, R extends O extends true ? false : boolean> {
    kind: 'scalar' | 'message';
    no: number;
    type: T;
    optional: O;
    repeat: R;
}

interface ScalarProtoFieldType<T extends ScalarType, O extends boolean, R extends O extends true ? false : boolean> extends BaseProtoFieldType<T, O, R> {
    kind: 'scalar';
}

interface MessageProtoFieldType<T extends () => ProtoMessageType, O extends boolean, R extends O extends true ? false : boolean> extends BaseProtoFieldType<T, O, R> {
    kind: 'message';
}

type ProtoFieldType =
    | ScalarProtoFieldType<ScalarType, boolean, boolean>
    | MessageProtoFieldType<() => ProtoMessageType, boolean, boolean>;

type ProtoMessageType = {
    [key: string]: ProtoFieldType;
};

export function ProtoField<T extends ScalarType, O extends boolean = false, R extends O extends true ? false : boolean = false>(no: number, type: T, optional?: O, repeat?: R): ScalarProtoFieldType<T, O, R>;
export function ProtoField<T extends () => ProtoMessageType, O extends boolean = false, R extends O extends true ? false : boolean = false>(no: number, type: T, optional?: O, repeat?: R): MessageProtoFieldType<T, O, R>;
export function ProtoField(no: number, type: ScalarType | (() => ProtoMessageType), optional?: boolean, repeat?: boolean): ProtoFieldType {
    if (typeof type === 'function') {
        return { kind: 'message', no: no, type: type, optional: optional ?? false, repeat: repeat ?? false };
    } else {
        return { kind: 'scalar', no: no, type: type, optional: optional ?? false, repeat: repeat ?? false };
    }
}

type ProtoFieldReturnType<T extends unknown, E extends boolean> = NonNullable<T> extends ScalarProtoFieldType<infer S, infer O, infer R>
    ? ScalarTypeToTsType<S>
    : T extends NonNullable<MessageProtoFieldType<infer S, infer O, infer R>>
    ? NonNullable<NapProtoStructType<ReturnType<S>, E>>
    : never;

type RequiredFieldsBaseType<T extends unknown, E extends boolean> = {
    [K in keyof T as T[K] extends { optional: true } ? never : LowerCamelCase<K & string>]:
    T[K] extends { repeat: true }
    ? ProtoFieldReturnType<T[K], E>[]
    : ProtoFieldReturnType<T[K], E>
}

type OptionalFieldsBaseType<T extends unknown, E extends boolean> = {
    [K in keyof T as T[K] extends { optional: true } ? LowerCamelCase<K & string> : never]?:
    T[K] extends { repeat: true }
    ? ProtoFieldReturnType<T[K], E>[]
    : ProtoFieldReturnType<T[K], E>
}

type RequiredFieldsType<T extends unknown, E extends boolean> = E extends true ? Partial<RequiredFieldsBaseType<T, E>> : RequiredFieldsBaseType<T, E>;

type OptionalFieldsType<T extends unknown, E extends boolean> = E extends true ? Partial<OptionalFieldsBaseType<T, E>> : OptionalFieldsBaseType<T, E>;

type NapProtoStructType<T extends unknown, E extends boolean> = RequiredFieldsType<T, E> & OptionalFieldsType<T, E>;

export type NapProtoEncodeStructType<T extends unknown> = NapProtoStructType<T, true>;

export type NapProtoDecodeStructType<T extends unknown> = NapProtoStructType<T, false>;

const NapProtoMsgCache = new Map<ProtoMessageType, MessageType<NapProtoStructType<ProtoMessageType, boolean>>>();

export class NapProtoMsg<T extends ProtoMessageType> {
    private readonly _msg: T;
    private readonly _field: PartialFieldInfo[];
    private readonly _proto_msg: MessageType<NapProtoStructType<T, boolean>>;

    constructor(fields: T) {
        this._msg = fields;
        this._field = Object.keys(fields).map(key => {
            const field = fields[key];
            if (field.kind === 'scalar') {
                const repeatType = field.repeat
                    ? [ScalarType.STRING, ScalarType.BYTES].includes(field.type)
                        ? RepeatType.UNPACKED
                        : RepeatType.PACKED
                    : RepeatType.NO;
                return {
                    no: field.no,
                    name: key,
                    kind: 'scalar',
                    T: field.type,
                    opt: field.optional,
                    repeat: repeatType,
                };
            } else if (field.kind === 'message') {
                return {
                    no: field.no,
                    name: key,
                    kind: 'message',
                    repeat: field.repeat ? RepeatType.PACKED : RepeatType.NO,
                    T: () => new NapProtoMsg(field.type())._proto_msg,
                };
            }
        }) as PartialFieldInfo[];
        this._proto_msg = new MessageType<NapProtoStructType<T, boolean>>('nya', this._field);
    }

    encode(data: NapProtoEncodeStructType<T>): Uint8Array {
        return this._proto_msg.toBinary(this._proto_msg.create(data as PartialMessage<NapProtoEncodeStructType<T>>));
    }

    decode(data: Uint8Array): NapProtoDecodeStructType<T> {
        return this._proto_msg.fromBinary(data) as NapProtoDecodeStructType<T>;
    }
}
