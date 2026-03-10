import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readSource (relativePath: string): string {
  return readFileSync(resolve(__dirname, relativePath), 'utf8');
}

describe('NapCat Action Contracts', () => {
  test('SendMsgBase should validate payload schema before normalizing messages', () => {
    const source = readSource('../napcat-onebot/action/msg/SendMsg.ts');

    const superCheckIndex = source.indexOf('const base = await super.check(payload);');
    const normalizeIndex = source.indexOf('const messages = normalize(payload.message);');

    expect(superCheckIndex).toBeGreaterThan(-1);
    expect(normalizeIndex).toBeGreaterThan(-1);
    expect(superCheckIndex).toBeLessThan(normalizeIndex);
  });

  test('send_private_msg and send_group_msg should reject missing routing ids during check', () => {
    const privateSource = readSource('../napcat-onebot/action/msg/SendPrivateMsg.ts');
    const groupSource = readSource('../napcat-onebot/action/group/SendGroupMsg.ts');

    expect(privateSource).toContain("message: '缺少参数 user_id'");
    expect(groupSource).toContain("message: '缺少参数 group_id'");
  });

  test('send_forward_msg should support messages alias and still normalize before super check', () => {
    const source = readSource('../napcat-onebot/action/go-cqhttp/SendForwardMsg.ts');

    expect(source).toContain('override payloadSchema = GoCQHTTPSendForwardPayloadSchema;');
    expect(source).toContain('if (payload.messages) payload.message = normalize(payload.messages);');
    expect(source).toContain('return super.check(payload);');
  });

  test('set_group_leave should branch between quit and destroy operations', () => {
    const actionSource = readSource('../napcat-onebot/action/group/SetGroupLeave.ts');
    const groupApiSource = readSource('../napcat-core/apis/group.ts');

    expect(actionSource).toContain('const isDismiss = typeof payload.is_dismiss === \'string\'');
    expect(actionSource).toContain('await this.core.apis.GroupApi.destroyGroup(payload.group_id.toString());');
    expect(actionSource).toContain('await this.core.apis.GroupApi.quitGroup(payload.group_id.toString());');
    expect(groupApiSource).toContain('async destroyGroup (groupCode: string) {');
  });
});
