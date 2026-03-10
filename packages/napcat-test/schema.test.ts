import { describe, expect, test } from 'vitest';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';
import { Type } from '@sinclair/typebox';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { OB11MessageDataSchema, OB11MessageNodeSchema, OB11MessageSchema, OB11PostSendMsgSchema } from '../napcat-onebot/types/message';
import { OB11MessageSchema as OB11ActionMessageSchema } from '../napcat-onebot/action/schemas';
import { GoCQHTTPActionsExamples } from '../napcat-onebot/action/example/GoCQHTTPActionsExamples';
import { GuildActionsExamples } from '../napcat-onebot/action/example/GuildActionsExamples';
import { OneBotConfigSchema, loadConfig as loadOneBotConfig, OneBotConfig } from '../napcat-onebot/config';
import { NapcatConfigSchema } from '../napcat-core/helper/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readSource (relativePath: string): string {
  return readFileSync(resolve(__dirname, relativePath), 'utf8');
}

describe('NapCat Schemas Compilation', () => {
  test('should compile OB11MessageDataSchema without duplicate id error', () => {
    expect(() => TypeCompiler.Compile(OB11MessageDataSchema)).not.toThrow();
  });

  test('should compile OB11MessageSchema without duplicate id error', () => {
    expect(() => TypeCompiler.Compile(OB11MessageSchema)).not.toThrow();
  });

  test('should compile OB11ActionMessageSchema without duplicate id error', () => {
    expect(() => TypeCompiler.Compile(OB11ActionMessageSchema)).not.toThrow();
  });

  test('should compile OB11PostSendMsgSchema without error', () => {
    expect(() => TypeCompiler.Compile(OB11PostSendMsgSchema)).not.toThrow();
  });

  test('should compile QuickAction hybrid schema without error', () => {
    const QASchema = Type.Object({
      message: OB11PostSendMsgSchema,
      quick_action: OB11ActionMessageSchema,
    });
    expect(() => TypeCompiler.Compile(QASchema)).not.toThrow();
  });
});

describe('NapCat Schemas Validation & Coercion', () => {
  test('should coerce numeric user_id to string in OB11PostSendMsgSchema', () => {
    const payload = {
      message_type: 'private',
      user_id: 123456,
      message: [{ type: 'text', data: { text: 'hello' } }],
    };

    let data: unknown = structuredClone(payload);
    data = Value.Parse(OB11PostSendMsgSchema, data);

    const compiler = TypeCompiler.Compile(OB11PostSendMsgSchema);
    expect(compiler.Check(data)).toBe(true);
    expect((data as Record<string, unknown>)['user_id']).toBe('123456');
  });

  test('should validate complex mixed messages correctly', () => {
    const payload = {
      message_type: 'group',
      group_id: '654321',
      message: 'this is a string message',
    };

    let data: unknown = structuredClone(payload);
    data = Value.Parse(OB11PostSendMsgSchema, data);

    const compiler = TypeCompiler.Compile(OB11PostSendMsgSchema);
    expect(compiler.Check(data)).toBe(true);
  });

  test('should accept id-only forward nodes', () => {
    const payload = {
      type: 'node',
      data: {
        id: '123456',
      },
    };

    let data: unknown = structuredClone(payload);
    data = Value.Parse(OB11MessageNodeSchema, data);

    const compiler = TypeCompiler.Compile(OB11MessageNodeSchema);
    expect(compiler.Check(data)).toBe(true);
  });

  test('should accept inline forward nodes with name but without nickname', () => {
    const payload = {
      type: 'node',
      data: {
        name: 'QQ用户',
        content: [{ type: 'text', data: { text: 'hello' } }],
      },
    };

    let data: unknown = structuredClone(payload);
    data = Value.Parse(OB11MessageNodeSchema, data);

    const compiler = TypeCompiler.Compile(OB11MessageNodeSchema);
    expect(compiler.Check(data)).toBe(true);
  });

  test('should accept inline forward nodes with numeric time', () => {
    const payload = {
      type: 'node',
      data: {
        nickname: 'QQ用户',
        content: [{ type: 'text', data: { text: 'hello' } }],
        time: 1741600000,
      },
    };

    let data: unknown = structuredClone(payload);
    data = Value.Parse(OB11MessageNodeSchema, data);

    const compiler = TypeCompiler.Compile(OB11MessageNodeSchema);
    expect(compiler.Check(data)).toBe(true);
  });
});

describe('NapCat Action Metadata', () => {
  test('should expose messages alias in forward message action source', () => {
    const source = readSource('../napcat-onebot/action/go-cqhttp/SendForwardMsg.ts');

    expect(source).toContain('const GoCQHTTPSendForwardPayloadSchema = Type.Union([');
    expect(source).toContain('messages: OB11MessageMixTypeSchema');
    expect(source).toContain('override payloadSchema = GoCQHTTPSendForwardPayloadSchema;');
  });

  test('should remove dead payload fields from action source', () => {
    const doubtFriendsSource = readSource('../napcat-onebot/action/new/SetDoubtFriendsAddRequest.ts');
    const albumLikeSource = readSource('../napcat-onebot/action/extends/SetGroupAlbumMediaLike.ts');

    expect(doubtFriendsSource).not.toContain('approve:');
    expect(albumLikeSource).not.toContain('set:');
  });

  test('should keep examples aligned with fixed action contracts', () => {
    const receiveOnlineFileSource = readSource('../napcat-onebot/action/file/online/ReceiveOnlineFile.ts');
    const testStreamDownloadSource = readSource('../napcat-onebot/action/stream/TestStreamDownload.ts');

    expect(receiveOnlineFileSource).toContain("element_id: '456'");
    expect(receiveOnlineFileSource).not.toContain('save_path');
    expect(testStreamDownloadSource).toContain('error: false');
    expect(GoCQHTTPActionsExamples.GoCQHTTPGetModelShow.response).toEqual([{
      variants: {
        model_show: 'napcat',
        need_pay: false,
      },
    }]);
  });

  test('should align shared examples and unimplemented action source', () => {
    const filesToCheck = [
      '../napcat-onebot/action/go-cqhttp/GoCQHTTPCheckUrlSafely.ts',
      '../napcat-onebot/action/go-cqhttp/GetOnlineClient.ts',
      '../napcat-onebot/action/go-cqhttp/GoCQHTTPSetModelShow.ts',
      '../napcat-onebot/action/guild/GetGuildList.ts',
      '../napcat-onebot/action/guild/GetGuildProfile.ts',
    ];

    for (const file of filesToCheck) {
      const source = readSource(file);
      expect(source).toContain('未实现');
      expect(source).toContain('override returnExample = null;');
    }

    expect(GoCQHTTPActionsExamples.GetOnlineClient.payload).toEqual({});
    expect(GoCQHTTPActionsExamples.GetOnlineClient.response).toBeNull();
    expect(GoCQHTTPActionsExamples.GoCQHTTPCheckUrlSafely.response).toBeNull();
    expect(GoCQHTTPActionsExamples.GoCQHTTPSetModelShow.payload).toEqual({});
    expect(GoCQHTTPActionsExamples.GoCQHTTPSetModelShow.response).toBeNull();
    expect(GuildActionsExamples.GetGuildList).toEqual({ payload: {}, response: null });
    expect(GuildActionsExamples.GetGuildProfile).toEqual({ payload: {}, response: null });
  });

  test('should add explicit empty payload schemas to no-arg actions', () => {
    const versionInfoSource = readSource('../napcat-onebot/action/system/GetVersionInfo.ts');
    const markAllReadSource = readSource('../napcat-onebot/action/msg/MarkMsgAsRead.ts');

    expect(versionInfoSource).toContain('const PayloadSchema = Type.Object({});');
    expect(versionInfoSource).toContain('override payloadSchema = PayloadSchema;');
    expect(markAllReadSource).toContain('const EmptyPayloadSchema = Type.Object({});');
    expect(markAllReadSource).toContain('override payloadSchema = EmptyPayloadSchema;');
  });
});

describe('NapCat Configuration Loaders', () => {
  test('OneBotConfig schemas should compile', () => {
    expect(() => TypeCompiler.Compile(OneBotConfigSchema)).not.toThrow();
  });

  test('OneBotConfig should load and apply defaults correctly', () => {
    const partialConfig: Partial<OneBotConfig> = {
      network: {
        httpServers: [{
          port: 3000,
          enable: true,
          name: 'test',
          host: '127.0.0.1',
          enableCors: true,
          enableWebsocket: false,
          messagePostFormat: 'array',
          token: '',
          debug: false,
        }],
        httpSseServers: [],
        httpClients: [],
        websocketServers: [],
        websocketClients: [],
        plugins: [],
      },
    };
    const loaded = loadOneBotConfig(partialConfig);
    expect(loaded.network.httpServers[0]?.host).toBe('127.0.0.1');
    expect(loaded.network.httpServers[0]?.enableCors).toBe(true);
    expect(loaded.musicSignUrl).toBe('');
  });

  test('NapcatConfig should compile and apply defaults', () => {
    let compiled: ReturnType<typeof TypeCompiler.Compile> | undefined;
    expect(() => {
      compiled = TypeCompiler.Compile(NapcatConfigSchema);
    }).not.toThrow();

    let data: unknown = {};
    data = Value.Parse(NapcatConfigSchema, data);

    expect(compiled?.Check(data)).toBe(true);
    const resolved = data as Record<string, unknown>;
    expect(resolved['consoleLog']).toBe(true);
    expect(resolved['consoleLogLevel']).toBe('info');
  });
});
