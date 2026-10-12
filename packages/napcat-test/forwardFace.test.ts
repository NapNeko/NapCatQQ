import { gunzipSync, inflateSync } from 'node:zlib';
import { describe, expect, it, vi } from 'vitest';
import { NapProtoMsg } from 'napcat-protobuf';
import { ChatType, ElementType, FaceType } from '@/napcat-core/types/msg';
import { PacketMsgConverter } from '@/napcat-core/packet/message/converter';
import { PacketMsgFaceElement } from '@/napcat-core/packet/message/element';
import { LongMsgResult, QBigFaceExtra, SendLongMsgReq } from '@/napcat-core/packet/transformer/proto';
import UploadForwardMsgV2 from '@/napcat-core/packet/transformer/message/UploadForwardMsgV2';
import { OneBotMsgApi } from '@/napcat-onebot/api/msg';
import { OB11MessageData, OB11MessageDataType } from '@/napcat-onebot/types/message';

// Keep the real message types without starting the adapter's WebUI/network modules.
vi.mock('@/napcat-onebot/index', async () => await import('@/napcat-onebot/types'));
vi.mock('napcat-core/packet/transformer/proto', async () => await import('@/napcat-core/packet/transformer/proto'));

const text = (value: string): OB11MessageData => ({
  type: OB11MessageDataType.text,
  data: { text: value },
});
const face = (id: string): OB11MessageData => ({
  type: OB11MessageDataType.face,
  data: { id },
});

async function buildForwardElements (content: OB11MessageData[], groupUin = 0) {
  const api = new OneBotMsgApi(
    {} as ConstructorParameters<typeof OneBotMsgApi>[0],
    {} as ConstructorParameters<typeof OneBotMsgApi>[1]
  );
  const { sendElements } = await api.createSendElements(content, {
    chatType: groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
    peerUid: groupUin ? String(groupUin) : 'u_friend',
    guildId: '',
  });
  const msg = new PacketMsgConverter().rawMsgWithSendMsgToPacketMsg({
    senderUin: 123456,
    senderName: '测试',
    groupId: groupUin,
    time: 1700000000,
    msg: sendElements,
  });
  const packet = UploadForwardMsgV2.build('u_self', [{ actionCommand: 'MultiMsg', actionMsg: [msg] }], groupUin);
  const request = new NapProtoMsg(SendLongMsgReq).decode(packet.data);
  const payload = new NapProtoMsg(LongMsgResult).decode(gunzipSync(request.info.payload!));
  return payload.action[0]!.actionData.msgBody[0]!.body!.richText!.elems;
}

describe.each([
  { name: 'private', groupUin: 0 },
  { name: 'group', groupUin: 654321 },
])('$name forward face encoding', ({ groupUin }) => {
  it('keeps the text immediately after the animated face in issue #2097', async () => {
    const elems = await buildForwardElements([text('1234'), face('317'), text('5678'), text('在')], groupUin);

    expect(elems).toMatchObject([
      { text: { str: '1234' } },
      { commonElem: { serviceType: 37 } },
      { text: { str: '/菜汪' } },
      { text: { str: '5678' } },
      { text: { str: '在' } },
    ]);
    expect(new NapProtoMsg(QBigFaceExtra).decode(elems[1]!.commonElem!.pbElem).faceId).toBe(317);
  });

  it('gives each consecutive animated face its own compatibility text', async () => {
    const elems = await buildForwardElements([face('317'), face('318'), text('after')], groupUin);

    expect(elems).toMatchObject([
      { commonElem: { serviceType: 37 } },
      { text: { str: '/菜汪' } },
      { commonElem: { serviceType: 37 } },
      { text: { str: '/崇拜' } },
      { text: { str: 'after' } },
    ]);
  });

  it('includes compatibility text when the animated face ends the node', async () => {
    const elems = await buildForwardElements([face('317')], groupUin);

    expect(elems).toMatchObject([
      { commonElem: { serviceType: 37 } },
      { text: { str: '/菜汪' } },
    ]);
  });

  it('keeps a non-text segment immediately after an animated face', async () => {
    const json = JSON.stringify({ app: 'test', prompt: 'card' });
    const elems = await buildForwardElements([
      face('317'),
      { type: OB11MessageDataType.json, data: { data: json } },
      text('after'),
    ], groupUin);

    expect(elems).toMatchObject([
      { commonElem: { serviceType: 37 } },
      { text: { str: '/菜汪' } },
      { lightAppElem: {} },
      { text: { str: 'after' } },
    ]);
    expect(inflateSync(elems[2]!.lightAppElem!.data.subarray(1)).toString()).toBe(json);
  });

  it('does not insert compatibility text after legacy or small faces', async () => {
    const elems = await buildForwardElements([face('14'), text('legacy'), face('264'), text('small')], groupUin);

    expect(elems).toMatchObject([
      { face: { index: 14 } },
      { text: { str: 'legacy' } },
      { commonElem: { serviceType: 33 } },
      { text: { str: 'small' } },
    ]);
  });
});

it.each([undefined, ''])('provides non-empty compatibility text when faceText is %s', (faceText) => {
  const face = new PacketMsgFaceElement({
    elementType: ElementType.FACE,
    elementId: '',
    faceElement: {
      faceIndex: 317,
      faceType: FaceType.AniSticke,
      faceText,
    },
  });

  expect(face.buildElement()).toMatchObject([
    { commonElem: { serviceType: 37 } },
    { text: { str: '[表情]' } },
  ]);
});
