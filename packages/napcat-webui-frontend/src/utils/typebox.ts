import { TSchema, Type } from '@sinclair/typebox';

export type ParsedSchema = {
  name?: string;
  type: string | string[];
  optional: boolean;
  value?: any;
  enum?: any[];
  children?: ParsedSchema[];
  description?: string;
};

// 定义基础响应结构 (TypeBox 格式)
export const BaseResponseSchema = Type.Object({
  status: Type.Union([Type.Literal('ok'), Type.Literal('failed')], { description: '状态 (ok/failed)' }),
  retcode: Type.Number({ description: '返回码' }),
  data: Type.Any({ description: '数据' }),
  message: Type.String({ description: '消息' }),
  wording: Type.String({ description: '提示' }),
  echo: Type.Optional(Type.String({ description: '回显' })),
});

export function parseTypeBox (schema: TSchema | undefined, name?: string, isRoot = true): ParsedSchema | ParsedSchema[] {
  if (!schema) {
    return isRoot ? [] : { name, type: 'unknown', optional: false };
  }

  // 如果是根节点解析，且我们需要将其包装在 BaseResponse 中（通常用于 response）
  // 但这里我们根据传入的 schema 决定

  const description = schema.description;
  const optional = false; // TypeBox schema doesn't store optionality in the same way Zod does, usually handled by parent object

  // Handle specific types
  const type = schema.type;

  if (schema.const !== undefined) {
    return { name, type: 'value', value: schema.const, optional, description };
  }

  if (schema.enum) {
    return { name, type: 'enum', enum: schema.enum, optional, description };
  }

  if (schema.anyOf || schema.oneOf) {
    const options = (schema.anyOf || schema.oneOf) as TSchema[];
    const children = options.map(opt => parseTypeBox(opt, undefined, false) as ParsedSchema);
    return { name, type: 'union', children, optional, description };
  }

  if (schema.allOf) {
    const parts = schema.allOf as TSchema[];
    // 如果全是对象，尝试合并属性
    const allProperties: Record<string, TSchema> = {};
    const allRequired: string[] = [];
    let canMerge = true;
    parts.forEach(part => {
      if (part.type === 'object' && part.properties) {
        Object.assign(allProperties, part.properties);
        if (part.required) allRequired.push(...part.required);
      } else {
        canMerge = false;
      }
    });

    if (canMerge) {
      return parseTypeBox({ ...schema, type: 'object', properties: allProperties, required: allRequired }, name, isRoot);
    }
    // 无法简单合并，当作联合展示
    const children = parts.map(part => parseTypeBox(part, undefined, false) as ParsedSchema);
    return { name, type: 'intersection', children, optional, description };
  }

  if (type === 'object') {
    const properties = schema.properties || {};
    const required = schema.required || [];
    const children = Object.keys(properties).map(key => {
      const child = parseTypeBox(properties[key], key, false) as ParsedSchema;
      child.optional = !required.includes(key);
      return child;
    });
    if (isRoot) return children;
    return { name, type: 'object', children, optional, description };
  }

  if (type === 'array') {
    const items = schema.items as TSchema;
    const child = parseTypeBox(items, undefined, false) as ParsedSchema;
    return { name, type: 'array', children: [child], optional, description };
  }

  if (type === 'string') return { name, type: 'string', optional, description };
  if (type === 'number' || type === 'integer') return { name, type: 'number', optional, description };
  if (type === 'boolean') return { name, type: 'boolean', optional, description };
  if (type === 'null') return { name, type: 'null', optional, description };

  return { name, type: type || 'unknown', optional, description };
}

export function generateDefaultFromTypeBox (schema: TSchema | undefined): any {
  if (!schema) return {};
  if (schema.const !== undefined) return schema.const;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum) return schema.enum[0];
  if (schema.anyOf || schema.oneOf) return generateDefaultFromTypeBox((schema.anyOf || schema.oneOf)[0]);

  const type = schema.type;
  if (type === 'object') {
    const obj: any = {};
    const props = schema.properties || {};
    for (const key in props) {
      // Only generate defaults for required properties or if we want a full example
      obj[key] = generateDefaultFromTypeBox(props[key]);
    }
    return obj;
  }
  if (type === 'array') return [];
  if (type === 'string') return '';
  if (type === 'number' || type === 'integer') return 0;
  if (type === 'boolean') return false;
  if (type === 'null') return null;
  return null;
}
