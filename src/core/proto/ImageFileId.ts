import { MessageType, BinaryReader, ScalarType, BinaryWriter } from '@protobuf-ts/runtime';

export const FileId = new MessageType("FileId", [
    { no: 2, name: "sha1", kind: "scalar", T: ScalarType.BYTES },
    { no: 4, name: "appid", kind: "scalar", T: ScalarType.UINT32 },
]);

export function encodePBFileId(message: any) {
    return FileId.internalBinaryWrite(message, new BinaryWriter(), {
        writerFactory: () => new BinaryWriter(),
        writeUnknownFields: false
    }).finish();
}

export function decodePBFileId(buffer: Uint8Array): any {
    const reader = new BinaryReader(buffer);
    return FileId.internalBinaryRead(reader, reader.len, {
        readUnknownField: true,
        readerFactory: () => new BinaryReader(buffer)
    });
}