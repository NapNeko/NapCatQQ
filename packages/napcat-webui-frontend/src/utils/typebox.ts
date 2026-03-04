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
  isTruncated?: boolean;    // 标记被截断
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

// 最大解析深度
const MAX_PARSE_DEPTH = 4;
// 最大生成深度
const MAX_GENERATE_DEPTH = 3;
// anyOf/oneOf 最大解析选项数量
const MAX_UNION_OPTIONS = 5;

export function parseTypeBox (
  schema: TSchema | undefined,
  name?: string,
  isRoot = true,
  visitedIds: Set<string> = new Set(),
  depth = 0
): ParsedSchema | ParsedSchema[] {
  // 基础检查
  if (!schema) {
    return isRoot ? [] : { name, type: 'unknown', optional: false };
  }

  // 深度限制检查
  if (depth > MAX_PARSE_DEPTH) {
    return { name, type: 'object', optional: false, description: '...', isCircularRef: true };
  }

  // $id 循环引用检查
  const schemaId = schema.$id;
  if (schemaId && visitedIds.has(schemaId)) {
    return { name, type: 'object', optional: false, description: `(${schemaId})`, isCircularRef: true };
  }

  // 创建副本并添加当前 $id
  const newVisitedIds = new Set(visitedIds);
  if (schemaId) {
    newVisitedIds.add(schemaId);
  }

  const description = schema.description;
  const optional = false;
  const type = schema.type;

  // 常量值
  if (schema.const !== undefined) {
    return { name, type: 'value', value: schema.const, optional, description };
  }

  // 枚举
  if (schema.enum) {
    return { name, type: 'enum', enum: schema.enum, optional, description };
  }

  // 联合类型 (anyOf/oneOf) - 限制解析的选项数量
  if (schema.anyOf || schema.oneOf) {
    const allOptions = (schema.anyOf || schema.oneOf) as TSchema[];
    // 只取前 MAX_UNION_OPTIONS 个选项
    const options = allOptions.slice(0, MAX_UNION_OPTIONS);
    const children = options.map(opt => parseTypeBox(opt, undefined, false, newVisitedIds, depth + 1) as ParsedSchema);

    // 如果有更多选项被截断
    if (allOptions.length > MAX_UNION_OPTIONS) {
      children.push({
        name: undefined,
        type: 'object',
        optional: false,
        description: `... 还有 ${allOptions.length - MAX_UNION_OPTIONS} 个类型`,
        isTruncated: true
      });
    }
    return { name, type: 'union', children, optional, description };
  }

  // allOf 交叉类型
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
      return parseTypeBox({ ...schema, type: 'object', properties: allProperties, required: allRequired }, name, isRoot, newVisitedIds, depth);
    }
    const children = parts.slice(0, MAX_UNION_OPTIONS).map(part => parseTypeBox(part, undefined, false, newVisitedIds, depth + 1) as ParsedSchema);
    return { name, type: 'intersection', children, optional, description };
  }

  // 对象类型
  if (type === 'object') {
    const properties = schema.properties || {};
    const required = schema.required || [];
    const keys = Object.keys(properties);
    const children = keys.map(key => {
      const child = parseTypeBox(properties[key], key, false, newVisitedIds, depth + 1) as ParsedSchema;
      child.optional = !required.includes(key);
      return child;
    });
    if (isRoot) return children;
    return { name, type: 'object', children, optional, description };
  }

  // 数组类型
  if (type === 'array') {
    const items = schema.items as TSchema;
    if (items) {
      const child = parseTypeBox(items, undefined, false, newVisitedIds, depth + 1) as ParsedSchema;
      return { name, type: 'array', children: [child], optional, description };
    }
    return { name, type: 'array', children: [], optional, description };
  }

  // 基础类型
  if (type === 'string') return { name, type: 'string', optional, description };
  if (type === 'number' || type === 'integer') return { name, type: 'number', optional, description };
  if (type === 'boolean') return { name, type: 'boolean', optional, description };
  if (type === 'null') return { name, type: 'null', optional, description };

  return { name, type: type || 'unknown', optional, description };
}

export function generateDefaultFromTypeBox (
  schema: TSchema | undefined,
  visitedIds: Set<string> = new Set(),
  depth = 0
): any {
  // 基础检查
  if (!schema) return {};

  // 深度限制
  if (depth > MAX_GENERATE_DEPTH) {
    return null;
  }

  // $id 循环引用检查
  const schemaId = schema.$id;
  if (schemaId && visitedIds.has(schemaId)) {
    return schema.type === 'array' ? [] : schema.type === 'object' ? {} : null;
  }

  // 创建副本并添加当前 $id
  const newVisitedIds = new Set(visitedIds);
  if (schemaId) {
    newVisitedIds.add(schemaId);
  }

  // 常量/默认值/枚举
  if (schema.const !== undefined) return schema.const;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum) return schema.enum[0];

  // 联合类型 - 优先选择简单类型
  if (schema.anyOf || schema.oneOf) {
    const options = (schema.anyOf || schema.oneOf) as TSchema[];
    // 优先找简单类型
    const stringOption = options.find(opt => opt.type === 'string');
    if (stringOption) return '';
    const numberOption = options.find(opt => opt.type === 'number' || opt.type === 'integer');
    if (numberOption) return 0;
    const boolOption = options.find(opt => opt.type === 'boolean');
    if (boolOption) return false;
    // 否则只取第一个
    if (options.length > 0) {
      return generateDefaultFromTypeBox(options[0], newVisitedIds, depth + 1);
    }
    return null;
  }

  const type = schema.type;

  // 对象类型
  if (type === 'object') {
    const obj: any = {};
    const props = schema.properties || {};
    const required = schema.required || [];

    // 只为必填字段和浅层字段生成默认值
    for (const key in props) {
      if (required.includes(key) || depth < 1) {
        obj[key] = generateDefaultFromTypeBox(props[key], newVisitedIds, depth + 1);
      }
    }
    return obj;
  }

  // 数组类型 - 返回空数组
  if (type === 'array') {
    return [];
  }

  // 基础类型
  if (type === 'string') return '';
  if (type === 'number' || type === 'integer') return 0;
  if (type === 'boolean') return false;
  if (type === 'null') return null;
  return null;
}
