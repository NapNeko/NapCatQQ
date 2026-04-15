import { describe, expect, test, vi } from 'vitest';
import { NapProtoMsg } from 'napcat-protobuf';
import { OidbSvcTrpcTcpBase } from '@/napcat-core/packet/transformer/proto/oidb/OidbBase';
import { OidbSvcTrpcTcp0XF90 } from '@/napcat-core/packet/transformer/proto/oidb/Oidb.0xf90';

vi.mock('@/napcat-core/packet/transformer/base', () => ({
  PacketTransformer: class PacketTransformer {
    protected msgBuilder: unknown;

    constructor () {
      this.msgBuilder = undefined;
    }
  },
  PacketBufBuilder: (str: Uint8Array) => Buffer.from(str),
}));

import SetGroupTodo from '@/napcat-core/packet/transformer/action/SetGroupTodo';
import CompleteGroupTodo from '@/napcat-core/packet/transformer/action/CompleteGroupTodo';
import CancelGroupTodo from '@/napcat-core/packet/transformer/action/CancelGroupTodo';

const decodePacket = (data: Buffer) => {
  const base = new NapProtoMsg(OidbSvcTrpcTcpBase).decode(data);
  const body = new NapProtoMsg(OidbSvcTrpcTcp0XF90).decode(base.body);
  return { base, body };
};

describe('Group todo packet builder', () => {
  test('builds OIDB 0xF90 subCommand 1 for set', () => {
    const packet = SetGroupTodo.build(123456, '789');
    const { base, body } = decodePacket(packet.data);

    expect(packet.cmd).toBe('OidbSvcTrpcTcp.0xF90_1');
    expect(base.command).toBe(0xF90);
    expect(base.subCommand).toBe(1);
    expect(body.groupUin).toBe(123456);
    expect(body.msgSeq).toBe('789');
  });

  test('builds OIDB 0xF90 subCommand 2 for complete', () => {
    const packet = CompleteGroupTodo.build(123456, '789');
    const { base, body } = decodePacket(packet.data);

    expect(packet.cmd).toBe('OidbSvcTrpcTcp.0xF90_2');
    expect(base.command).toBe(0xF90);
    expect(base.subCommand).toBe(2);
    expect(body.groupUin).toBe(123456);
    expect(body.msgSeq).toBe('789');
  });

  test('builds OIDB 0xF90 subCommand 3 for cancel', () => {
    const packet = CancelGroupTodo.build(123456, '789');
    const { base, body } = decodePacket(packet.data);

    expect(packet.cmd).toBe('OidbSvcTrpcTcp.0xF90_3');
    expect(base.command).toBe(0xF90);
    expect(base.subCommand).toBe(3);
    expect(body.groupUin).toBe(123456);
    expect(body.msgSeq).toBe('789');
  });
});
