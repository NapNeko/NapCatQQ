import { getAllHandlers } from '@/napcat-onebot/action/index';
import { AutoRegisterRouter } from '@/napcat-onebot/action/auto-register';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { TSchema } from '@sinclair/typebox';
import { fileURLToPath } from 'node:url';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ActionSchemaInfo {
  payload?: TSchema;
  return?: TSchema;
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
    console.warn('Init schemas partial failure (expected due to complex imports), proceeding with collected data...');
  }

  const openapi: Record<string, unknown> = {
    openapi: '3.1.0',
    info: {
      title: 'NapCat OneBot 11 API',
      description: 'Auto-generated OpenAPI schema for NapCat OneBot 11 actions',
      version: '1.0.0'
    },
    paths: {} as Record<string, unknown>
  };

  for (const [actionName, schemas] of Object.entries(actionSchemas)) {
    if (!schemas.payload) continue;
    const path = `/${actionName}`;

    const cleanPayload = JSON.parse(JSON.stringify(schemas.payload || { type: 'object', properties: {} }));
    const cleanReturn = JSON.parse(JSON.stringify(schemas.return || { type: 'object', properties: {} }));

    if (schemas.payloadExample) {
      cleanPayload.example = schemas.payloadExample;
    }
    if (schemas.returnExample) {
      cleanReturn.example = schemas.returnExample;
    }

    const paths = openapi['paths'] as Record<string, any>;
    const responses: Record<string, unknown> = {
      '200': {
        description: '成功',
        content: {
          'application/json': {
            schema: cleanReturn
          }
        }
      }
    };

    if (schemas.errorExamples) {
      schemas.errorExamples.forEach(error => {
        responses[error.code.toString()] = {
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

    paths[path] = {
      post: {
        summary: actionName,
        description: schemas.description || actionName,
        tags: schemas.tags || ['Default'],
        requestBody: {
          content: {
            'application/json': {
              schema: cleanPayload
            }
          }
        },
        responses: responses
      }
    };
  }
  const outputPath = resolve(__dirname, 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(openapi, null, 2));
  console.log(`OpenAPI schema generated at: ${outputPath}`);
}
generateOpenAPI();