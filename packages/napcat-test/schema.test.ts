import { describe, expect, test, vi } from 'vitest';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';
import { Type } from '@sinclair/typebox';

import { OB11MessageDataSchema, OB11MessageNodeSchema, OB11MessageSchema, OB11PostSendMsgSchema } from '../napcat-onebot/types/message';
import { OB11MessageSchema as OB11ActionMessageSchema } from '../napcat-onebot/action/schemas';
import { GoCQHTTPActionsExamples } from '../napcat-onebot/action/example/GoCQHTTPActionsExamples';
import { GuildActionsExamples } from '../napcat-onebot/action/example/GuildActionsExamples';
import { OneBotConfigSchema, loadConfig as loadOneBotConfig, OneBotConfig } from '../napcat-onebot/config';
import { NapcatConfigSchema } from '../napcat-core/helper/config';
import { GoCQHTTPSendForwardMsg, GoCQHTTPSendGroupForwardMsg, GoCQHTTPSendPrivateForwardMsg } from '../napcat-onebot/action/go-cqhttp/SendForwardMsg';
import { GetOnlineClient } from '../napcat-onebot/action/go-cqhttp/GetOnlineClient';
import { GoCQHTTPCheckUrlSafely } from '../napcat-onebot/action/go-cqhttp/GoCQHTTPCheckUrlSafely';
import { GoCQHTTPGetModelShow } from '../napcat-onebot/action/go-cqhttp/GoCQHTTPGetModelShow';
import { GoCQHTTPSetModelShow } from '../napcat-onebot/action/go-cqhttp/GoCQHTTPSetModelShow';
import { SetGroupAlbumMediaLike } from '../napcat-onebot/action/extends/SetGroupAlbumMediaLike';
import { ReceiveOnlineFile } from '../napcat-onebot/action/file/online/ReceiveOnlineFile';
import { GetGuildList } from '../napcat-onebot/action/guild/GetGuildList';
import { GetGuildProfile } from '../napcat-onebot/action/guild/GetGuildProfile';
import { MarkAllMsgAsRead } from '../napcat-onebot/action/msg/MarkMsgAsRead';
import { SetDoubtFriendsAddRequest } from '../napcat-onebot/action/new/SetDoubtFriendsAddRequest';
import { TestDownloadStream } from '../napcat-onebot/action/stream/TestStreamDownload';
import GetVersionInfo from '../napcat-onebot/action/system/GetVersionInfo';

vi.mock('napcat-core', () => ({
  ChatType: {
    KCHATTYPEGROUP: 2,
    KCHATTYPEC2C: 1,
    KCHATTYPETEMPC2CFROMGROUP: 3,
  },
  ElementType: {
    TEXT: 'text',
    PIC: 'pic',
    REPLY: 'reply',
    FILE: 'file',
    VIDEO: 'video',
    ARK: 'ark',
    PTT: 'ptt',
  },
  NapCatCore: class {},
}));

vi.mock('napcat-core/types', () => ({
  ChatType: {
    KCHATTYPEGROUP: 2,
    KCHATTYPEC2C: 1,
    KCHATTYPETEMPC2CFROMGROUP: 3,
  },
}));

function hasTopLevelProperty (schema: unknown, key: string): boolean {
  if (!schema || typeof schema !== 'object') {
    return false;
  }

  const typedSchema = schema as {
    properties?: Record<string, unknown>,
    allOf?: unknown[],
    anyOf?: unknown[],
    oneOf?: unknown[],
  };

  if (typedSchema.properties && key in typedSchema.properties) {
    return true;
  }

  return ['allOf', 'anyOf', 'oneOf'].some((field) => {
    const children = typedSchema[field as keyof typeof typedSchema];
    return Array.isArray(children) && children.some(child => hasTopLevelProperty(child, key));
  });
}

function createCoreStub () {
  return {
    context: {
      logger: {
        logError: vi.fn(),
        logDebug: vi.fn(),
        logWarn: vi.fn(),
      },
    },
  } as any;
}

function createAction<T> (ActionClass: new (...args: any[]) => T): T {
  return new ActionClass({} as any, createCoreStub());
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

  test('should reject forward reference nodes with empty id', () => {
    const payload = {
      type: 'node',
      data: {
        id: '',
      },
    };

    const compiler = TypeCompiler.Compile(OB11MessageNodeSchema);
    expect(compiler.Check(payload)).toBe(false);
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

  test('should reject forward nodes that mix reference and inline payload fields', () => {
    const payload = {
      type: 'node',
      data: {
        id: '123456',
        content: [{ type: 'text', data: { text: 'hello' } }],
      },
    };

    const compiler = TypeCompiler.Compile(OB11MessageNodeSchema);
    expect(compiler.Check(payload)).toBe(false);
  });
});

describe('NapCat Action Metadata', () => {
  test('should export messages alias in forward message action schemas', () => {
    const actions = [
      createAction(GoCQHTTPSendForwardMsg),
      createAction(GoCQHTTPSendPrivateForwardMsg),
      createAction(GoCQHTTPSendGroupForwardMsg),
    ];

    for (const action of actions) {
      expect(hasTopLevelProperty((action as any).payloadSchema, 'messages')).toBe(true);
      expect(hasTopLevelProperty((action as any).payloadSchema, 'message')).toBe(false);
    }
  });

  test('should remove dead payload fields from action schemas', () => {
    const doubtFriendAction = createAction(SetDoubtFriendsAddRequest);
    const albumLikeAction = createAction(SetGroupAlbumMediaLike);

    expect(hasTopLevelProperty((doubtFriendAction as any).payloadSchema, 'approve')).toBe(false);
    expect(hasTopLevelProperty((albumLikeAction as any).payloadSchema, 'set')).toBe(false);
  });

  test('should keep examples aligned with fixed action contracts', () => {
    const receiveOnlineFileAction = createAction(ReceiveOnlineFile);
    const testStreamDownloadAction = createAction(TestDownloadStream);
    const getModelShowAction = createAction(GoCQHTTPGetModelShow);

    expect((receiveOnlineFileAction as any).payloadExample).toEqual({
      user_id: '123456789',
      msg_id: '123',
      element_id: '456',
    });
    expect((testStreamDownloadAction as any).payloadExample).toEqual({ error: false });
    expect((getModelShowAction as any).returnExample).toEqual([{
      variants: {
        model_show: 'napcat',
        need_pay: false,
      },
    }]);
  });

  test('should keep compatibility placeholder metadata aligned with runtime responses', () => {
    const compatibilityActions = [
      createAction(GoCQHTTPCheckUrlSafely),
      createAction(GetOnlineClient),
      createAction(GoCQHTTPSetModelShow),
      createAction(GetGuildList),
      createAction(GetGuildProfile),
    ];

    for (const action of compatibilityActions) {
      expect((action as any).supported).toBe(true);
      expect((action as any).unsupportedReason).toBeUndefined();
    }

    expect(GoCQHTTPActionsExamples.GetOnlineClient.payload).toEqual({});
    expect(GoCQHTTPActionsExamples.GetOnlineClient.response).toEqual([]);
    expect(GoCQHTTPActionsExamples.GoCQHTTPCheckUrlSafely.response).toEqual({ level: 1 });
    expect(GoCQHTTPActionsExamples.GoCQHTTPSetModelShow.payload).toEqual({});
    expect(GoCQHTTPActionsExamples.GoCQHTTPSetModelShow.response).toEqual(null);
    expect(GuildActionsExamples.GetGuildList).toEqual({ payload: {}, response: null });
    expect(GuildActionsExamples.GetGuildProfile).toEqual({ payload: {}, response: null });

    expect((createAction(GetOnlineClient) as any).returnSchema).toMatchObject({ type: 'array' });
    expect((createAction(GoCQHTTPCheckUrlSafely) as any).returnExample).toEqual({ level: 1 });
    expect((createAction(GoCQHTTPSetModelShow) as any).returnSchema).toMatchObject({ type: 'null' });
    expect((createAction(GetGuildList) as any).returnSchema).toMatchObject({ type: 'null' });
    expect((createAction(GetGuildProfile) as any).returnSchema).toMatchObject({ type: 'null' });
  });

  test('should add explicit empty payload schemas to no-arg actions', () => {
    const getVersionInfoAction = createAction(GetVersionInfo);
    const markAllMsgAsReadAction = createAction(MarkAllMsgAsRead);

    expect((getVersionInfoAction as any).payloadSchema).toMatchObject({ type: 'object' });
    expect((markAllMsgAsReadAction as any).payloadSchema).toMatchObject({ type: 'object' });
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
