import { getAllHandlers } from '@/napcat-onebot/action/index';
import { AutoRegisterRouter } from '@/napcat-onebot/action/auto-register';
import { writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TSchema } from '@sinclair/typebox';
import { OneBotAction, ActionExamples } from '@/napcat-onebot/action/OneBotAction';
import { napCatVersion } from 'napcat-common/src/version';
import * as MessageSchemas from '@/napcat-onebot/types/message';
import * as ActionSchemas from '@/napcat-onebot/action/schemas';

/* -------------------------------------------------------------------------- */
/*                                   基础类型                                  */
/* -------------------------------------------------------------------------- */

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

type JsonObject = { [key: string]: unknown; };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OPENAPI_OUTPUT_PATH = resolve(__dirname, 'openapi.json');
const MISSING_REPORT_PATH = resolve(__dirname, 'missing_props.log');

export const actionSchemas: Record<string, ActionSchemaInfo> = {};

/* -------------------------------------------------------------------------- */
/*                                   日志工具                                  */
/* -------------------------------------------------------------------------- */

/**
 * 统一日志前缀，方便在构建日志中快速检索。
 */
const LOG_SCOPE = '[napcat-schema]';

function logSection (title: string) {
  console.log(`\n${LOG_SCOPE} ── ${title}`);
}

function logInfo (message: string) {
  console.log(`${LOG_SCOPE} ℹ ${message}`);
}

function logWarn (message: string) {
  console.warn(`${LOG_SCOPE} ⚠ ${message}`);
}

function logSuccess (message: string) {
  console.log(`${LOG_SCOPE} ✅ ${message}`);
}

/* -------------------------------------------------------------------------- */
/*                          OpenAPI 基础组件（固定部分）                        */
/* -------------------------------------------------------------------------- */

const BaseResponseSchema: JsonObject = {
  type: 'object',
  'x-schema-id': 'BaseResponse',
  properties: {
    status: { type: 'string', description: '状态 (ok/failed)' },
    retcode: { type: 'number', description: '返回码' },
    message: { type: 'string', description: '消息' },
    wording: { type: 'string', description: '提示' },
    stream: {
      type: 'string',
      description: '流式响应',
      enum: ['stream-action', 'normal-action']
    }
  },
  required: ['status', 'retcode']
};

const EmptyDataSchema: JsonObject = {
  description: '无数据',
  type: 'null'
};

const DEFAULT_SUCCESS_EXAMPLE_VALUE = {
  status: 'ok',
  retcode: 0,
  data: {},
  message: '',
  wording: '',
  stream: 'normal-action'
} as const;

const DEFAULT_ERROR_EXAMPLE_DEFINITIONS = ActionExamples.Common.errors;

const SUCCESS_DEFAULT_EXAMPLE_KEY = 'Success_Default';

function isObjectRecord (value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isEmptyObject (value: unknown): value is Record<string, never> {
  return isObjectRecord(value) && Object.keys(value).length === 0;
}

function isEmptyArray (value: unknown): value is [] {
  return Array.isArray(value) && value.length === 0;
}

function isMeaninglessSuccessExampleData (value: unknown): boolean {
  return value === null || isEmptyObject(value) || isEmptyArray(value);
}

function resolveCommonErrorExampleKey (error: { code: number, description: string; }): string | null {
  const matched = DEFAULT_ERROR_EXAMPLE_DEFINITIONS.find(
    item => item.code === error.code && item.description === error.description
  );
  return matched ? `Error_${matched.code}` : null;
}

/* -------------------------------------------------------------------------- */
/*                                 通用工具函数                                */
/* -------------------------------------------------------------------------- */

/**
 * 深拷贝 schema，优先使用 structuredClone，失败时回落到 JSON 序列化。
 */
function cloneSchema<T> (schema: T): T {
  if (typeof globalThis.structuredClone === 'function') {
    try {
      return globalThis.structuredClone(schema);
    } catch {
      // fallback
    }
  }
  return JSON.parse(JSON.stringify(schema)) as T;
}

/**
 * 在 anyOf/oneOf 中，将“多个单值 enum 分支 + 可选 nullable 分支”压缩为单个 enum。
 *
 * 例：
 * - anyOf: [{ type:'string', enum:['a'] }, { type:'string', enum:['b'] }]
 * -> { type:'string', enum:['a','b'] }
 */
function collapseSingleValueEnumCombinator (items: unknown[]): Record<string, unknown> | null {
  const enumValues: unknown[] = [];
  let type: string | undefined;
  let nullable = false;

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const branch = item as Record<string, unknown>;

    // 兼容仅有 nullable 的分支
    if (branch['nullable'] === true && Object.keys(branch).length === 1) {
      nullable = true;
      continue;
    }

    const branchEnum = branch['enum'];
    if (!Array.isArray(branchEnum) || branchEnum.length !== 1) {
      return null;
    }

    enumValues.push(branchEnum[0]);

    if (typeof branch['type'] === 'string') {
      if (!type) {
        type = branch['type'];
      } else if (type !== branch['type']) {
        return null;
      }
    }
  }

  if (enumValues.length === 0) {
    return null;
  }

  const merged: Record<string, unknown> = { enum: [...new Set(enumValues)] };
  if (type) {
    merged['type'] = type;
  }
  if (nullable) {
    merged['nullable'] = true;
  }
  return merged;
}

/**
 * 将 TypeBox/JSON-Schema 映射为 OpenAPI 3.1 兼容结构。
 *
 * 关键规则：
 * - $id -> x-schema-id（保留标识用于后续 $ref 替换）
 * - const -> enum:[const]
 * - type:'void' / type:'undefined' -> type:'null'
 * - nullable:true -> type 包含 'null'
 * - anyOf/oneOf 的简单 enum 分支做压缩
 */
function sanitizeSchemaForOpenAPI<T> (schema: T): T {
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const next: Record<string, unknown> = {};

      for (const [key, child] of Object.entries(obj)) {
        // 特殊处理 properties 容器：只遍历每个属性的 schema，避免将容器对象误判为 schema 元对象
        if (key === 'properties' && child && typeof child === 'object' && !Array.isArray(child)) {
          const cleanProps: Record<string, unknown> = {};
          for (const [propName, propSchema] of Object.entries(child as Record<string, unknown>)) {
            cleanProps[propName] = walk(propSchema);
          }
          next[key] = cleanProps;
          continue;
        }

        if (key === '$id') {
          if (typeof child === 'string' && child.length > 0) {
            next['x-schema-id'] = child;
          }
          continue;
        }

        if (key === 'const') {
          next['enum'] = [child];
          continue;
        }

        if (key === 'type' && typeof child === 'string') {
          if (child === 'void' || child === 'undefined') {
            next['type'] = 'null';
          } else {
            next['type'] = child;
          }
          continue;
        }

        if (key === 'type' && Array.isArray(child)) {
          const types = child
            .filter((t): t is string => typeof t === 'string')
            .map(t => (t === 'void' || t === 'undefined') ? 'null' : t);

          const normalizedTypes = [...new Set(types)];
          if (normalizedTypes.length === 0) {
            next['type'] = 'null';
          } else if (normalizedTypes.length === 1) {
            next['type'] = normalizedTypes[0];
          } else {
            next['type'] = normalizedTypes;
          }
          continue;
        }

        if ((key === 'anyOf' || key === 'oneOf') && Array.isArray(child)) {
          const normalized = child.map(walk);
          const mergedEnum = collapseSingleValueEnumCombinator(normalized);
          if (mergedEnum) {
            Object.assign(next, mergedEnum);
          } else {
            next[key] = normalized;
          }
          continue;
        }

        next[key] = walk(child);
      }

      // OpenAPI 3.1：将 nullable 归一到 type 包含 null
      if (next['nullable'] === true) {
        const currentType = next['type'];
        if (typeof currentType === 'string') {
          next['type'] = currentType === 'null' ? 'null' : [currentType, 'null'];
        } else if (Array.isArray(currentType)) {
          const normalizedTypes = [
            ...new Set(currentType
              .filter((t): t is string => typeof t === 'string')
              .map(t => (t === 'void' || t === 'undefined') ? 'null' : t)
              .concat('null'))
          ];
          next['type'] = normalizedTypes.length === 1 ? normalizedTypes[0] : normalizedTypes;
        } else if (!('anyOf' in next) && !('oneOf' in next) && !('allOf' in next) && !('$ref' in next)) {
          next['type'] = 'null';
        }
        delete next['nullable'];
      }

      // 兜底：仅有描述/元信息但缺少 type 时，补 object，避免严格校验失败
      if (
        !('type' in next)
        && !('$ref' in next)
        && !('anyOf' in next)
        && !('oneOf' in next)
        && !('allOf' in next)
        && !('enum' in next)
        && !('properties' in next)
        && !('items' in next)
      ) {
        const schemaMetaKeys = [
          'description', 'title', 'default', 'examples', 'example',
          'deprecated', 'readOnly', 'writeOnly', 'x-schema-id'
        ];

        if (schemaMetaKeys.some(key => key in next)) {
          next['type'] = 'object';
        }
      }

      return next;
    }

    return value;
  };

  return walk(schema) as T;
}

/* -------------------------------------------------------------------------- */
/*                         Schema 注册 & 引用替换逻辑                           */
/* -------------------------------------------------------------------------- */

/**
 * 将模块中所有“含 $id 的导出 schema”注册到 components.schemas。
 */
function registerSchemasFromModule (
  openapi: JsonObject,
  source: Record<string, unknown>,
  sourceName: string
) {
  const components = ((openapi['components'] as JsonObject)['schemas'] as JsonObject);
  let registeredCount = 0;
  let duplicatedCount = 0;

  for (const exportedValue of Object.values(source)) {
    if (!exportedValue || typeof exportedValue !== 'object') {
      continue;
    }

    const schema = cloneSchema(exportedValue) as JsonObject;
    const schemaId = typeof schema['$id'] === 'string' && (schema['$id'] as string).length > 0
      ? schema['$id'] as string
      : '';

    if (!schemaId) {
      continue;
    }

    if (components[schemaId]) {
      duplicatedCount += 1;
      logWarn(`发现重复 schema id（${sourceName}）：${schemaId}，将覆盖旧定义`);
    }

    components[schemaId] = sanitizeSchemaForOpenAPI(schema);
    registeredCount += 1;
  }

  logInfo(`${sourceName} 注册完成：${registeredCount} 个 schema，重复 ${duplicatedCount} 个`);
}

/**
 * 对 components.schemas 做去内联：
 * - 若子节点含 x-schema-id 且在 components.schemas 可命中
 * - 则替换为 $ref
 *
 * 注意：组件根节点不会替换为自身，避免根级自引用。
 */
function replaceComponentInlineSchemasWithRefs (openapi: JsonObject) {
  const components = openapi['components'] as JsonObject | undefined;
  const schemas = components?.['schemas'] as JsonObject | undefined;

  if (!schemas || typeof schemas !== 'object') {
    return;
  }

  const availableSchemaIds = new Set(Object.keys(schemas));
  let replacedCount = 0;

  const walk = (value: unknown, ownerSchemaId: string): unknown => {
    if (Array.isArray(value)) {
      return value.map(item => walk(item, ownerSchemaId));
    }

    if (value && typeof value === 'object') {
      const obj = value as JsonObject;
      const schemaId = obj['x-schema-id'];

      if (
        typeof schemaId === 'string'
        && schemaId !== ownerSchemaId
        && availableSchemaIds.has(schemaId)
      ) {
        replacedCount += 1;
        return { $ref: `#/components/schemas/${schemaId}` };
      }

      const next: JsonObject = {};
      for (const [key, child] of Object.entries(obj)) {
        next[key] = walk(child, ownerSchemaId);
      }
      return next;
    }

    return value;
  };

  for (const [schemaId, schema] of Object.entries(schemas)) {
    schemas[schemaId] = walk(schema, schemaId);
  }

  logInfo(`components 内联替换完成：${replacedCount} 处`);
}

/**
 * 对 paths 做去内联：
 * - 若节点含 x-schema-id 且在 components.schemas 可命中
 * - 则替换为 $ref
 */
function replacePathInlineSchemasWithRefs (openapi: JsonObject) {
  const paths = openapi['paths'];
  const components = openapi['components'] as JsonObject | undefined;
  const schemas = components?.['schemas'] as JsonObject | undefined;

  if (!paths || typeof paths !== 'object' || !schemas || typeof schemas !== 'object') {
    return;
  }

  const availableSchemaIds = new Set(Object.keys(schemas));
  let replacedCount = 0;

  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value && typeof value === 'object') {
      const obj = value as JsonObject;
      const schemaId = obj['x-schema-id'];

      if (typeof schemaId === 'string' && availableSchemaIds.has(schemaId)) {
        replacedCount += 1;
        return { $ref: `#/components/schemas/${schemaId}` };
      }

      const next: JsonObject = {};
      for (const [key, child] of Object.entries(obj)) {
        next[key] = walk(child);
      }
      return next;
    }

    return value;
  };

  openapi['paths'] = walk(paths) as JsonObject;
  logInfo(`paths 内联替换完成：${replacedCount} 处`);
}

/* -------------------------------------------------------------------------- */
/*                               Action 收集逻辑                               */
/* -------------------------------------------------------------------------- */

/**
 * 收集全部 action schema 信息。
 */
export function initSchemas () {
  const handlers = getAllHandlers(null as any, null as any);

  handlers.forEach(handler => {
    if (!handler.actionName || (handler.actionName as string) === 'unknown') {
      return;
    }

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
  });

  AutoRegisterRouter.forEach(ActionClass => {
    const handler = new ActionClass(null as any, null as any);
    if (!handler.actionName || (handler.actionName as string) === 'unknown') {
      return;
    }

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
  });
}

/* -------------------------------------------------------------------------- */
/*                             OpenAPI 构建主流程                               */
/* -------------------------------------------------------------------------- */

function createOpenAPIDocument (): Record<string, unknown> {
  const componentExamples: Record<string, unknown> = {
    [SUCCESS_DEFAULT_EXAMPLE_KEY]: {
      summary: '成功响应',
      value: DEFAULT_SUCCESS_EXAMPLE_VALUE
    }
  };

  DEFAULT_ERROR_EXAMPLE_DEFINITIONS.forEach(error => {
    componentExamples[`Error_${error.code}`] = {
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

  return {
    openapi: '3.1.0',
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
      schemas: {
        BaseResponse: BaseResponseSchema,
        EmptyData: EmptyDataSchema
      },
      examples: componentExamples,
      responses: {},
      securitySchemes: {}
    },
    servers: [],
    security: []
  };
}

function buildResponseExamples (schemas: ActionSchemaInfo): Record<string, unknown> {
  const successData = schemas.returnExample ?? {};
  const examples: Record<string, any> = {
    Success: isMeaninglessSuccessExampleData(successData)
      ? { $ref: `#/components/examples/${SUCCESS_DEFAULT_EXAMPLE_KEY}` }
      : {
        summary: '成功响应',
        value: {
          status: 'ok',
          retcode: 0,
          data: successData,
          message: '',
          wording: '',
          stream: 'normal-action'
        }
      }
  };

  if (schemas.errorExamples) {
    schemas.errorExamples.forEach(error => {
      const commonErrorKey = resolveCommonErrorExampleKey(error);
      examples[`Error_${error.code}`] = commonErrorKey
        ? { $ref: `#/components/examples/${commonErrorKey}` }
        : {
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
    return examples;
  }

  examples['Generic_Error'] = {
    $ref: '#/components/examples/Error_1400'
  };

  return examples;
}

function appendActionPaths (openapi: Record<string, unknown>) {
  const paths = openapi['paths'] as Record<string, any>;

  for (const [actionName, schemas] of Object.entries(actionSchemas)) {
    if (!schemas.payload && !schemas.summary) {
      continue;
    }

    const path = `/${actionName}`;
    const cleanPayload = schemas.payload
      ? sanitizeSchemaForOpenAPI(cloneSchema(schemas.payload))
      : { type: 'object', properties: {} };
    const cleanReturn = schemas.return
      ? sanitizeSchemaForOpenAPI(cloneSchema(schemas.return))
      : { $ref: '#/components/schemas/EmptyData' };

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
                Default: {
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
                  allOf: [
                    { $ref: '#/components/schemas/BaseResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          ...(typeof cleanReturn === 'object' && cleanReturn ? cleanReturn : {}),
                          description: '业务数据'
                        }
                      }
                    }
                  ]
                },
                examples: buildResponseExamples(schemas)
              }
            }
          }
        },
        security: []
      }
    };
  }
}

export function generateOpenAPI () {
  logSection('开始生成 OpenAPI 文档');

  try {
    initSchemas();
    logInfo(`已收集 action: ${Object.keys(actionSchemas).length} 个`);
  } catch {
    logWarn('初始化 schema 过程中出现部分失败，将继续使用已收集的数据');
  }

  const openapi = createOpenAPIDocument();

  logSection('注册组件 schema');
  registerSchemasFromModule(openapi as JsonObject, MessageSchemas, 'types/message.ts');
  registerSchemasFromModule(openapi as JsonObject, ActionSchemas, 'action/schemas.ts');

  logSection('处理组件内联引用');
  replaceComponentInlineSchemasWithRefs(openapi as JsonObject);

  logSection('构建 paths');
  appendActionPaths(openapi);

  logSection('处理 paths 内联引用');
  replacePathInlineSchemasWithRefs(openapi as JsonObject);

  writeFileSync(OPENAPI_OUTPUT_PATH, JSON.stringify(openapi, null, 2));
  logSuccess(`OpenAPI 生成完成：${OPENAPI_OUTPUT_PATH}`);

  generateMissingReport();
}

/* -------------------------------------------------------------------------- */
/*                               元数据缺失报告                                */
/* -------------------------------------------------------------------------- */

function generateMissingReport () {
  const missingReport: string[] = [];

  for (const [actionName, schemas] of Object.entries(actionSchemas)) {
    const missing: string[] = [];
    if (!schemas.summary) missing.push('actionSummary');
    if (!schemas.tags || schemas.tags.length === 0) missing.push('actionTags');
    if (schemas.payloadExample === undefined && schemas.payload) missing.push('payloadExample');
    if (schemas.returnExample === undefined) missing.push('returnExample');

    if (missing.length > 0) {
      missingReport.push(`[${actionName}] 缺失属性: ${missing.join(', ')}`);
    }
  }

  if (missingReport.length > 0) {
    writeFileSync(MISSING_REPORT_PATH, missingReport.join('\n'));
    logWarn(`检查到 ${missingReport.length} 个接口元数据缺失，报告已写入：${MISSING_REPORT_PATH}`);
    return;
  }

  if (existsSync(MISSING_REPORT_PATH)) {
    writeFileSync(MISSING_REPORT_PATH, '');
  }
  logSuccess('所有接口元数据完整');
}

generateOpenAPI();
