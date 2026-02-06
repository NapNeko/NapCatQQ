import { getAllHandlers } from '@/napcat-onebot/action/index';
import { AutoRegisterRouter } from '@/napcat-onebot/action/auto-register';
import { writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { TSchema } from '@sinclair/typebox';
import { fileURLToPath } from 'node:url';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { napCatVersion } from 'napcat-common/src/version';
import { OB11MessageDataSchema } from '@/napcat-onebot/types/message';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ActionSchemaInfo {
  payload?: TSchema;
  return?: TSchema;
  summary?: string;
  description?: string;
  tags?: string[];
  payloadExample?: unknown;
  returnExample?: unknown;
  errorExamples?: Array<{ code: number, description: string; }>;
}

type JsonObject = Record<string, any>;

export const actionSchemas: Record<string, ActionSchemaInfo> = {};

function cloneSchema<T> (schema: T): T {
  if (typeof globalThis.structuredClone === 'function') {
    try {
      return globalThis.structuredClone(schema);
    } catch {
      // fallback to JSON serialization
    }
  }
  return JSON.parse(JSON.stringify(schema)) as T;
}

function sanitizeSchemaForOpenAPI<T> (schema: T): T {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const next: Record<string, unknown> = {};

      for (const [key, child] of Object.entries(obj)) {
        if (key === '$id') {
          if (typeof child === 'string' && child.length > 0) {
            next['x-schema-id'] = child;
          }
          continue;
        }
        next[key] = walk(child);
      }

      return next;
    }

    return value;
  };

  return walk(schema) as T;
}

/**
 * 仅提取“消息段定义”到 components.schemas：
 * - 根：OB11MessageData（anyOf）
 * - 分支：OB11MessageText / OB11MessageImage / ...
 *
 * 不提取 OB11PostSendMsg / OB11Message / OB11MessageMixType / TS interface 等其它定义。
 */
function registerMessageSegmentComponents (openapi: JsonObject) {
  const components = ((openapi['components'] as JsonObject)['schemas'] as JsonObject);

  const messageData = cloneSchema(OB11MessageDataSchema) as JsonObject;
  const rootId = typeof messageData['$id'] === 'string' && messageData['$id'].length > 0
    ? messageData['$id']
    : 'OB11MessageData';

  const branches = Array.isArray(messageData['anyOf']) ? messageData['anyOf'] : [];
  const rootAnyOfRefs: Array<{ $ref: string; }> = [];

  for (const branch of branches) {
    const segmentSchema = cloneSchema(branch) as JsonObject;
    const segId = typeof segmentSchema['$id'] === 'string' && segmentSchema['$id'].length > 0
      ? segmentSchema['$id']
      : '';

    if (!segId) {
      // 没有 $id 的分支跳过，不纳入 components
      continue;
    }

    components[segId] = sanitizeSchemaForOpenAPI(segmentSchema);
    rootAnyOfRefs.push({ $ref: `#/components/schemas/${segId}` });
  }

  // 根定义保留为 anyOf，但改为引用 components 中已注册的消息段
  components[rootId] = sanitizeSchemaForOpenAPI({
    ...messageData,
    anyOf: rootAnyOfRefs
  });

  console.log(`Registered message segment components: ${rootAnyOfRefs.length} segments + 1 root`);
}

export function initSchemas () {
  const handlers = getAllHandlers(null as any, null as any);
  handlers.forEach(handler => {
    if (handler.actionName && (handler.actionName as string) !== 'unknown') {
      const action = handler as OneBotAction<unknown, unknown>;
      actionSchemas[handler.actionName] = {
        payload: action.payloadSchema,
        return: action.returnSchema,
        summary: action.actionSummary,
        description: action.actionDescription,
        tags: action.actionTags,
        payloadExample: action.payloadExample,
        returnExample: action.returnExample,
        errorExamples: action.errorExamples
      };
    }
  });
  AutoRegisterRouter.forEach((ActionClass) => {
    const handler = new ActionClass(null as any, null as any);
    if (handler.actionName && (handler.actionName as string) !== 'unknown') {
      const action = handler as OneBotAction<unknown, unknown>;
      actionSchemas[handler.actionName] = {
        payload: action.payloadSchema,
        return: action.returnSchema,
        summary: action.actionSummary,
        description: action.actionDescription,
        tags: action.actionTags,
        payloadExample: action.payloadExample,
        returnExample: action.returnExample,
        errorExamples: action.errorExamples
      };
    }
  });
}

export function generateOpenAPI () {
  try {
    initSchemas();
  } catch (e) {
    console.warn('Init schemas partial failure, proceeding with collected data...');
  }

  const openapi: Record<string, unknown> = {
    openapi: '3.0.1',
    info: {
      title: 'NapCat OneBot 11 HTTP API',
      description: 'NapCatOneBot11 HTTP POST 接口文档',
      version: napCatVersion
    },
    tags: [
      { name: '消息接口', description: '发送、删除、获取消息相关接口' },
      { name: '群组接口', description: '群组管理、成员管理相关接口' },
      { name: '用户接口', description: '好友管理、个人信息相关接口' },
      { name: '系统接口', description: '状态获取、重启、缓存清理相关接口' },
      { name: '文件接口', description: '文件上传下载、预览相关接口' }
    ],
    paths: {} as Record<string, unknown>,
    components: {
      schemas: {},
      responses: {},
      securitySchemes: {}
    },
    servers: [],
    security: []
  };

  // 只把消息段定义写入 components，不改 action path 的内联 schema 逻辑
  registerMessageSegmentComponents(openapi as JsonObject);

  for (const [actionName, schemas] of Object.entries(actionSchemas)) {
    if (!schemas.payload && !schemas.summary) continue;

    const path = '/' + actionName;
    const cleanPayload = schemas.payload
      ? sanitizeSchemaForOpenAPI(cloneSchema(schemas.payload))
      : { type: 'object', properties: {} };
    const cleanReturn = schemas.return
      ? sanitizeSchemaForOpenAPI(cloneSchema(schemas.return))
      : { type: 'object', properties: {} };

    // 构造响应示例
    const responseExamples: Record<string, any> = {
      'Success': {
        summary: '成功响应',
        value: {
          status: 'ok',
          retcode: 0,
          data: schemas.returnExample || {},
          message: '',
          wording: '',
          stream: 'normal-action'
        }
      }
    };

    if (schemas.errorExamples) {
      schemas.errorExamples.forEach(error => {
        responseExamples['Error_' + error.code] = {
          summary: error.description,
          value: {
            status: 'failed',
            retcode: error.code,
            data: null,
            message: error.description,
            wording: error.description,
            stream: 'normal-action'
          }
        };
      });
    } else {
      // 默认提供一个通用错误
      responseExamples['Generic_Error'] = {
        summary: '通用错误',
        value: {
          status: 'failed',
          retcode: 1400,
          data: null,
          message: '请求参数错误或业务逻辑执行失败',
          wording: '请求参数错误或业务逻辑执行失败',
          stream: 'normal-action'
        }
      };
    }

    const paths = openapi['paths'] as Record<string, any>;
    paths[path] = {
      post: {
        summary: schemas.summary || actionName,
        deprecated: false,
        description: schemas.description || '',
        tags: schemas.tags || [],
        parameters: [],
        requestBody: {
          description: 'API 参数',
          content: {
            'application/json': {
              schema: cleanPayload,
              examples: {
                'Default': {
                  summary: '默认请求示例',
                  value: schemas.payloadExample || {}
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '业务响应',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', description: '状态 (ok/failed)' },
                    retcode: { type: 'number', description: '返回码' },
                    data: { ...cleanReturn, description: '数据' },
                    message: { type: 'string', description: '消息' },
                    wording: { type: 'string', description: '提示' },
                    stream: { type: 'string', description: '流式响应', enum: ['stream-action', 'normal-action'] }
                  },
                  required: ['status', 'retcode', 'data']
                },
                examples: responseExamples
              }
            }
          }
        },
        security: []
      }
    };
  }

  const outputPath = resolve(__dirname, 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(openapi, null, 2));
  console.log('OpenAPI schema (3.0.1 Format) generated at: ' + outputPath);

  generateMissingReport();
}

function generateMissingReport () {
  const missingReport: string[] = [];
  for (const [actionName, schemas] of Object.entries(actionSchemas)) {
    const missing: string[] = [];
    if (!schemas.summary) missing.push('actionSummary');
    if (!schemas.tags || schemas.tags.length === 0) missing.push('actionTags');
    if (schemas.payloadExample === undefined && schemas.payload) missing.push('payloadExample');
    if (schemas.returnExample === undefined) missing.push('returnExample');

    if (missing.length > 0) {
      missingReport.push('[' + actionName + '] 缺失属性: ' + missing.join(', '));
    }
  }

  const reportPath = resolve(__dirname, 'missing_props.log');
  if (missingReport.length > 0) {
    writeFileSync(reportPath, missingReport.join('\n'));
    console.warn('\n检查到 ' + missingReport.length + ' 个接口存在元数据缺失，报告已保存至: ' + reportPath);
  } else {
    if (existsSync(reportPath)) writeFileSync(reportPath, '');
    console.log('\n所有接口元数据已完整！');
  }
}

generateOpenAPI();
