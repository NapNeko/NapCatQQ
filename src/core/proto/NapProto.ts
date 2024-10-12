import { MessageType, RepeatType, ScalarType } from '@protobuf-ts/runtime';
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
    repeated: R;
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

function ProtoField<T extends ScalarType, O extends boolean = false, R extends O extends true ? false : boolean = false>(no: number, type: T, repeated?: R, optional?: O): ScalarProtoFieldType<T, O, R>;
function ProtoField<T extends () => ProtoMessageType, O extends boolean = false, R extends O extends true ? false : boolean = false>(no: number, type: T, repeated?: R, optional?: O): MessageProtoFieldType<T, O, R>;
function ProtoField(no: number, type: ScalarType | (() => ProtoMessageType), repeated?: boolean, optional?: boolean): ProtoFieldType {
    if (typeof type === 'function') {
        return { kind: 'message', no: no, type: type, repeated: repeated ?? false, optional: optional ?? false };
    } else {
        return { kind: 'scalar', no: no, type: type, repeated: repeated ?? false, optional: optional ?? false };
    }
}

type ProtoFieldReturnType<T> = T extends ScalarProtoFieldType<infer S, infer R, infer O>
    ? ScalarTypeToTsType<S>
    : T extends MessageProtoFieldType<infer S, infer R, infer O>
    ? ProtoStructType<ReturnType<S>>
    : never;

type RequiredFieldsType<T> = {
    [K in keyof T as T[K] extends {
        optional: true
    } | MessageProtoFieldType<any, any, any> ? never : LowerCamelCase<K & string>]
    : T[K] extends { repeated: true }
    ? ProtoFieldReturnType<T[K]>[]
    : ProtoFieldReturnType<T[K]>
};

type OptionalFieldsType<T> = {
    [K in keyof T as T[K] extends {
        optional: true
    } | MessageProtoFieldType<any, any, any> ? LowerCamelCase<K & string> : never]?:
    T[K] extends { repeated: true }
    ? ProtoFieldReturnType<T[K]>[]
    : ProtoFieldReturnType<T[K]>
};

type ProtoStructType<T> = RequiredFieldsType<T> & OptionalFieldsType<T>;

const NapProtoMsgCache = new Map<ProtoMessageType, MessageType<ProtoStructType<ProtoMessageType>>>();

class NapProtoMsg<T extends ProtoMessageType> {
    private readonly _msg: T;
    private readonly _field: PartialFieldInfo[];
    private readonly _proto_msg: MessageType<ProtoStructType<T>>;

    constructor(fields: T) {
        this._msg = fields;
        this._field = Object.keys(fields).map(key => {
            const field = fields[key];
            if (field.kind === 'scalar') {
                const repeatType = field.repeated
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
                const rt = NapProtoMsgCache.get(field.type()) ?? (() => {
                    const msg = new NapProtoMsg(field.type());
                    NapProtoMsgCache.set(field.type(), msg._proto_msg);
                    return msg._proto_msg;
                })();
                return {
                    no: field.no,
                    name: key,
                    kind: 'message',
                    repeat: field.repeated ? RepeatType.PACKED : RepeatType.NO,
                    T: () => rt,
                };
            }
        }) as PartialFieldInfo[];
        this._proto_msg = new MessageType<ProtoStructType<T>>('nya', this._field);
    }

    encode(data: ProtoStructType<T>): Uint8Array {
        return this._proto_msg.toBinary(data);
    }

    decode(data: Uint8Array): ProtoStructType<T> {
        return this._proto_msg.fromBinary(data);
    }
}
