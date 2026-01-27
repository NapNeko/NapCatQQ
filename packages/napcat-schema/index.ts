import { getAllHandlers } from '@/napcat-onebot/action/index';
import { AutoRegisterRouter } from '@/napcat-onebot/action/auto-register';
import { writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { TSchema } from '@sinclair/typebox';
import { fileURLToPath } from 'node:url';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { napCatVersion } from 'napcat-common/src/version';

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

export const actionSchemas: Record<string, ActionSchemaInfo> = {};

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
      schemas: {},
      responses: {},
      securitySchemes: {}
    },
    servers: [],
    security: []
  };

  for (const [actionName, schemas] of Object.entries(actionSchemas)) {
    if (!schemas.payload && !schemas.summary) continue;

    const path = '/' + actionName;
    const cleanPayload = schemas.payload ? JSON.parse(JSON.stringify(schemas.payload)) : { type: 'object', properties: {} };
    const cleanReturn = schemas.return ? JSON.parse(JSON.stringify(schemas.return)) : { type: 'object', properties: {} };

    // 构造响应示例
    const responseExamples: Record<string, any> = {
      'Success': {
        summary: '成功响应',
        value: {
          status: 'ok',
          retcode: 0,
          data: schemas.returnExample || {},
          message: '',
          wording: ''
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
            wording: error.description
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
          wording: '请求参数错误或业务逻辑执行失败'
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
                    wording: { type: 'string', description: '提示' }
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
