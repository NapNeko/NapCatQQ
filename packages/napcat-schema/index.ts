import { getAllHandlers } from '@/napcat-onebot/action/index';
import { AutoRegisterRouter } from '@/napcat-onebot/action/auto-register';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { TSchema } from '@sinclair/typebox';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const actionSchemas: Record<string, { payload?: TSchema, return?: TSchema; }> = {};


export function initSchemas () {
  const handlers = getAllHandlers(null as any, null as any);
  handlers.forEach(handler => {
    if (handler.actionName && (handler.actionName as string) !== 'unknown') {
      actionSchemas[handler.actionName] = {
        payload: handler.payloadSchema,
        return: handler.returnSchema
      };
    }
  });
  AutoRegisterRouter.forEach((ActionClass) => {
    const handler = new ActionClass(null as any, null as any);
    if (handler.actionName && (handler.actionName as string) !== 'unknown') {
      actionSchemas[handler.actionName] = {
        payload: handler.payloadSchema,
        return: handler.returnSchema
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

  const openapi: any = {
    openapi: '3.1.0',
    info: {
      title: 'NapCat OneBot 11 API',
      description: 'Auto-generated OpenAPI schema for NapCat OneBot 11 actions',
      version: '1.0.0'
    },
    paths: {}
  };

  for (const [actionName, schemas] of Object.entries(actionSchemas)) {
    if (!schemas.payload) continue;
    const path = `/${actionName}`;

    const cleanPayload = JSON.parse(JSON.stringify(schemas.payload || { type: 'object', properties: {} }));
    const cleanReturn = JSON.parse(JSON.stringify(schemas.return || { type: 'object', properties: {} }));

    openapi.paths[path] = {
      post: {
        summary: actionName,
        requestBody: {
          content: {
            'application/json': {
              schema: cleanPayload
            }
          }
        },
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: cleanReturn
              }
            }
          }
        }
      }
    };
  }
  const outputPath = resolve(__dirname, 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(openapi, null, 2));
  console.log(`OpenAPI schema generated at: ${outputPath}`);
}
generateOpenAPI();