import { getAllHandlers } from '@/napcat-onebot/action/index';
import { AutoRegisterRouter } from '@/napcat-onebot/action/auto-register';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { TSchema } from '@sinclair/typebox';
import { fileURLToPath } from 'node:url';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';

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
  errorExamples?: Array<{ code: number, description: string }>;
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
      description: '本文档描述 NapCat OneBot 11 的 HTTP POST 接口协议。所有接口均通过 POST 请求调用，请求体为 JSON 格式。',
      version: '1.0.0'
    },
    tags: [
      { name: '消息接口', description: '发送、删除、获取消息相关接口' },
      { name: '群组接口', description: '群组管理、成员管理相关接口' },
      { name: '用户接口', description: '好友管理、个人信息相关接口' },
      { name: '系统接口', description: '状态获取、重启、缓存清理相关接口' },
      { name: '文件接口', description: '文件上传下载、预览相关接口' },
      { name: '系统扩展', description: 'NapCat 特有的系统级扩展功能' },
      { name: '群扩展', description: 'NapCat 特有的群组级扩展功能' },
      { name: '用户扩展', description: 'NapCat 特有的用户级扩展功能' },
      { name: '文件扩展', description: 'NapCat 特有的文件级扩展功能' },
      { name: 'Go-CQHTTP', description: '兼容 Go-CQHTTP 的特定接口' }
    ],
    paths: {} as Record<string, unknown>
  };

  for (const [actionName, schemas] of Object.entries(actionSchemas)) {
    // 忽略没有定义参数且没有 Summary 的占位接口
    if (!schemas.payload && !schemas.summary) continue;

    const path = '/' + actionName;
    const cleanPayload = schemas.payload ? JSON.parse(JSON.stringify(schemas.payload)) : { type: 'object', properties: {} };
    const cleanReturn = schemas.return ? JSON.parse(JSON.stringify(schemas.return)) : { type: 'object', properties: {} };

    // HTTP 响应结构: {"status": "ok", "retcode": 0, "data": ...}
    const httpResponseSchema = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'async', 'failed'], description: '执行状态', example: 'ok' },
        retcode: { type: 'number', description: '响应码 (0 为成功)', example: 0 },
        data: { ...cleanReturn, description: '响应数据' },
        message: { type: 'string', description: '错误消息', example: '' },
        wording: { type: 'string', description: '提示消息', example: '' }
      },
      required: ['status', 'retcode', 'data']
    };

    const responses: Record<string, unknown> = {
      '200': {
        description: '成功响应',
        content: {
          'application/json': {
            schema: httpResponseSchema,
            example: {
              status: 'ok',
              retcode: 0,
              data: schemas.returnExample || {},
              message: '',
              wording: ''
            }
          }
        }
      }
    };

    // 处理错误示例
    if (schemas.errorExamples) {
      schemas.errorExamples.forEach(error => {
        const codeStr = error.code.toString();
        responses[codeStr] = {
          description: error.description,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'failed' },
                  retcode: { type: 'number', example: error.code },
                  data: { type: 'null' },
                  message: { type: 'string', example: error.description }
                }
              }
            }
          }
        };
      });
    }

    const paths = openapi['paths'] as Record<string, any>;
    paths[path] = {
      post: {
        summary: schemas.summary || actionName,
        description: schemas.description || 'API Action: ' + actionName,
        tags: schemas.tags || ['Default'],
        requestBody: {
          description: 'API 请求参数',
          content: {
            'application/json': {
              schema: cleanPayload,
              example: schemas.payloadExample || {}
            }
          }
        },
        responses: responses
      }
    };
  }

  const outputDir = resolve(__dirname, 'dist');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = resolve(outputDir, 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(openapi, null, 2));
  console.log('OpenAPI schema (HTTP Format) generated at: ' + outputPath);

  // 生成审计报告
  generateMissingReport();
}

function generateMissingReport() {
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

  const reportPath = resolve(__dirname, 'dist', 'missing_props.log');
  if (missingReport.length > 0) {
    writeFileSync(reportPath, missingReport.join('\n'));
    console.warn('\n检查到 ' + missingReport.length + ' 个接口存在元数据缺失，报告已保存至: ' + reportPath);
  } else {
    if (existsSync(reportPath)) writeFileSync(reportPath, '');
    console.log('\n所有接口元数据已完整！');
  }
}

generateOpenAPI();
