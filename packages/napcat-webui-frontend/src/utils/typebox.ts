import { TSchema, Type } from '@sinclair/typebox';

export type ParsedSchema = {
  name?: string;
  type: string | string[];
  optional: boolean;
  value?: any;
  enum?: any[];
  children?: ParsedSchema[];
  description?: string;
  isCircularRef?: boolean;  // 标记循环引用
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

// 最大解析深度，防止过深的嵌套
const MAX_PARSE_DEPTH = 6;

/**
 * 获取 schema 的唯一标识符用于循环引用检测
 * 优先使用 $id 字符串标识符
 */
function getSchemaId (schema: TSchema): string | undefined {
  // 优先使用 $id
  if (schema.$id) {
    return schema.$id;
  }
  return undefined;
}

/**
 * 收集 schema 中所有的 $id，用于预先检测可能的循环引用
 */
function collectSchemaIds (schema: TSchema, ids: Set<string> = new Set()): Set<string> {
  if (!schema) return ids;
  if (schema.$id) {
    ids.add(schema.$id);
  }
  if (schema.anyOf) {
    (schema.anyOf as TSchema[]).forEach(s => collectSchemaIds(s, ids));
  }
  if (schema.oneOf) {
    (schema.oneOf as TSchema[]).forEach(s => collectSchemaIds(s, ids));
  }
  if (schema.allOf) {
    (schema.allOf as TSchema[]).forEach(s => collectSchemaIds(s, ids));
  }
  if (schema.items) {
    collectSchemaIds(schema.items as TSchema, ids);
  }
  if (schema.properties) {
    Object.values(schema.properties).forEach(s => collectSchemaIds(s as TSchema, ids));
  }
  return ids;
}

export function parseTypeBox (
  schema: TSchema | undefined,
  name?: string,
  isRoot = true,
  visited: Set<string | TSchema> = new Set(),
  depth = 0
): ParsedSchema | ParsedSchema[] {
  if (!schema) {
    return isRoot ? [] : { name, type: 'unknown', optional: false };
  }

  // 检查深度限制
  if (depth > MAX_PARSE_DEPTH) {
    return { name, type: 'object', optional: false, description: '(嵌套层级过深)', isCircularRef: true };
  }

  // 检查循环引用
  const schemaId = getSchemaId(schema);
  if (visited.has(schemaId)) {
    const refName = typeof schemaId === 'string' ? schemaId : (schema.description || 'object');
    return { name, type: 'object', optional: false, description: `(循环引用: ${refName})`, isCircularRef: true };
  }

  // 对于复合类型，加入访问集合
  const isComplexType = schema.type === 'object' || schema.type === 'array' || schema.anyOf || schema.oneOf || schema.allOf;
  if (isComplexType) {
    visited = new Set(visited); // 创建副本避免影响兄弟节点的解析
    visited.add(schemaId);
  }

  const description = schema.description;
  const optional = false;
  const type = schema.type;

  if (schema.const !== undefined) {
    return { name, type: 'value', value: schema.const, optional, description };
  }

  if (schema.enum) {
    return { name, type: 'enum', enum: schema.enum, optional, description };
  }

  if (schema.anyOf || schema.oneOf) {
    const options = (schema.anyOf || schema.oneOf) as TSchema[];
    const children = options.map(opt => parseTypeBox(opt, undefined, false, visited, depth + 1) as ParsedSchema);
    return { name, type: 'union', children, optional, description };
  }

  if (schema.allOf) {
    const parts = schema.allOf as TSchema[];
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
      return parseTypeBox({ ...schema, type: 'object', properties: allProperties, required: allRequired }, name, isRoot, visited, depth);
    }
    const children = parts.map(part => parseTypeBox(part, undefined, false, visited, depth + 1) as ParsedSchema);
    return { name, type: 'intersection', children, optional, description };
  }

  if (type === 'object') {
    const properties = schema.properties || {};
    const required = schema.required || [];
    const children = Object.keys(properties).map(key => {
      const child = parseTypeBox(properties[key], key, false, visited, depth + 1) as ParsedSchema;
      child.optional = !required.includes(key);
      return child;
    });
    if (isRoot) return children;
    return { name, type: 'object', children, optional, description };
  }

  if (type === 'array') {
    const items = schema.items as TSchema;
    const child = parseTypeBox(items, undefined, false, visited, depth + 1) as ParsedSchema;
    return { name, type: 'array', children: [child], optional, description };
  }

  if (type === 'string') return { name, type: 'string', optional, description };
  if (type === 'number' || type === 'integer') return { name, type: 'number', optional, description };
  if (type === 'boolean') return { name, type: 'boolean', optional, description };
  if (type === 'null') return { name, type: 'null', optional, description };

  return { name, type: type || 'unknown', optional, description };
}

// 最大生成深度
const MAX_GENERATE_DEPTH = 8;

export function generateDefaultFromTypeBox (
  schema: TSchema | undefined,
  visited: Set<string | TSchema> = new Set(),
  depth = 0
): any {
  if (!schema) return {};

  // 检查深度限制
  if (depth > MAX_GENERATE_DEPTH) {
    return null;
  }

  // 检查循环引用
  const schemaId = getSchemaId(schema);
  if (visited.has(schemaId)) {
    // 遇到循环引用，返回空值而不是继续递归
    return schema.type === 'array' ? [] : schema.type === 'object' ? {} : null;
  }

  if (schema.const !== undefined) return schema.const;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum) return schema.enum[0];

  if (schema.anyOf || schema.oneOf) {
    const options = (schema.anyOf || schema.oneOf) as TSchema[];
    // 优先选择非递归的简单类型
    const simpleOption = options.find(opt => opt.type === 'string' || opt.type === 'number' || opt.type === 'boolean');
    if (simpleOption) {
      return generateDefaultFromTypeBox(simpleOption, visited, depth + 1);
    }
    return generateDefaultFromTypeBox(options[0], visited, depth + 1);
  }

  const type = schema.type;

  if (type === 'object') {
    // 对于复合类型，加入访问集合
    visited = new Set(visited);
    visited.add(schemaId);

    const obj: any = {};
    const props = schema.properties || {};
    const required = schema.required || [];

    for (const key in props) {
      // 只为必填字段生成默认值，减少嵌套深度
      if (required.includes(key) || depth < 3) {
        obj[key] = generateDefaultFromTypeBox(props[key], visited, depth + 1);
      }
    }
    return obj;
  }

  if (type === 'array') {
    // 数组类型返回空数组，避免在数组项中继续递归
    return [];
  }

  if (type === 'string') return '';
  if (type === 'number' || type === 'integer') return 0;
  if (type === 'boolean') return false;
  if (type === 'null') return null;
  return null;
}
