import {
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodLazy,
  ZodLiteral,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodRecord,
  ZodSchema,
  ZodString,
  ZodTuple,
  ZodTypeAny,
  ZodUnion,
  ZodUnknown
} from 'zod'

export type LiteralValue = string | number | boolean | null

export type ParsedSchema = {
  name?: string
  type: string | string[]
  optional: boolean
  value?: LiteralValue
  enum?: LiteralValue[]
  children?: ParsedSchema[]
  description?: string
}

export function parse(
  schema: ZodTypeAny,
  name?: string,
  isRoot = true
): ParsedSchema | ParsedSchema[] {
  const optional = schema.isOptional ? schema.isOptional() : false
  const description = schema.description
  if (schema instanceof ZodString) {
    return { name, type: 'string', optional, description }
  }

  if (schema instanceof ZodNumber) {
    return { name, type: 'number', optional, description }
  }

  if (schema instanceof ZodBoolean) {
    return { name, type: 'boolean', optional, description }
  }

  if (schema instanceof ZodBigInt) {
    return { name, type: 'bigint', optional, description }
  }

  if (schema instanceof ZodDate) {
    return { name, type: 'date', optional, description }
  }

  if (schema instanceof ZodUnknown) {
    return { name, type: 'unknown', optional, description }
  }

  if (schema instanceof ZodLiteral) {
    return {
      name,
      type: 'value',
      optional,
      value: schema._def.value as LiteralValue,
      description
    }
  }

  if (schema instanceof ZodEnum) {
    const data = {
      name,
      type: 'enum',
      optional,
      enum: schema._def.values as LiteralValue[],
      description
    }
    return data
  }

  if (schema instanceof ZodUnion) {
    const options = schema._def.options
    const parsedOptions = options.map(
      (option: ZodTypeAny) => parse(option, undefined, false) as ParsedSchema
    )

    const basicTypes = [
      'string',
      'number',
      'boolean',
      'bigint',
      'date',
      'unknown',
      'value',
      'enum'
    ]
    const optionTypes: (string | string[])[] = parsedOptions.map(
      (option: ParsedSchema) => option.type
    )
    const isAllBasicTypes = optionTypes.every((type) =>
      basicTypes.includes(Array.isArray(type) ? type[0] : type)
    )

    if (isAllBasicTypes) {
      const types = [
        ...new Set(
          optionTypes.flatMap((type) => (Array.isArray(type) ? type[0] : type))
        )
      ]
      return { name, type: types, optional, description }
    } else {
      return {
        name,
        type: 'union',
        optional,
        children: parsedOptions,
        description
      }
    }
  }

  if (schema instanceof ZodObject) {
    const shape = schema._def.shape()
    const children = Object.keys(shape).map((key) =>
      parse(shape[key], key, false)
    ) as ParsedSchema[]
    if (isRoot) {
      return children
    } else {
      return { name, type: 'object', optional, children, description }
    }
  }

  if (schema instanceof ZodArray) {
    const childSchema = parse(
      schema._def.type,
      undefined,
      false
    ) as ParsedSchema
    return {
      name,
      type: 'array',
      optional,
      children: Array.isArray(childSchema) ? childSchema : [childSchema],
      description
    }
  }

  if (schema instanceof ZodNullable || schema instanceof ZodDefault) {
    return parse(schema._def.innerType, name)
  }

  if (schema instanceof ZodOptional) {
    const data = parse(schema._def.innerType, name)
    if (Array.isArray(data)) {
      data.forEach((item) => {
        item.optional = true
        item.description = description
      })
    } else {
      data.optional = true
      data.description = description
    }
    return data
  }

  if (schema instanceof ZodRecord) {
    const valueType = parse(schema._def.valueType) as ParsedSchema
    return {
      name,
      type: 'record',
      optional,
      children: [valueType],
      description
    }
  }

  if (schema instanceof ZodTuple) {
    const items: ParsedSchema[] = schema._def.items.map((item: ZodTypeAny) =>
      parse(item)
    )
    return { name, type: 'tuple', optional, children: items, description }
  }

  if (schema instanceof ZodNull) {
    return { name, type: 'null', optional, description }
  }

  if (schema instanceof ZodLazy) {
    return parse(schema._def.getter(), name)
  }

  if (schema instanceof ZodEffects) {
    return parse(schema._def.schema, name)
  }

  return { name, type: 'unknown', optional, description }
}

const generateDefault = (schema: ZodSchema): unknown => {
  if (schema instanceof ZodObject) {
    const obj: Record<string, unknown> = {}
    for (const key in schema.shape) {
      obj[key] = generateDefault(schema.shape[key])
    }
    return obj
  }
  if (schema instanceof ZodString) {
    return 'textValue'
  }
  if (schema instanceof ZodNumber) {
    return 0
  }
  if (schema instanceof ZodBoolean) {
    return false
  }
  if (schema instanceof ZodArray) {
    return []
  }
  if (schema instanceof ZodUnion) {
    return generateDefault(schema._def.options[0])
  }
  if (schema instanceof ZodEnum) {
    return schema._def.values[0]
  }
  if (schema instanceof ZodLiteral) {
    return schema._def.value
  }
  if (schema instanceof ZodNullable) {
    return null
  }
  if (schema instanceof ZodOptional) {
    return generateDefault(schema._def.innerType)
  }
  if (schema instanceof ZodRecord) {
    return {}
  }
  if (schema instanceof ZodTuple) {
    return schema._def.items.map((item: ZodTypeAny) => generateDefault(item))
  }
  if (schema instanceof ZodNull) {
    return null
  }
  if (schema instanceof ZodLazy) {
    return generateDefault(schema._def.getter())
  }
  if (schema instanceof ZodEffects) {
    return generateDefault(schema._def.schema)
  }
  return null
}

export const generateDefaultJson = (schema: ZodSchema) => {
  return JSON.stringify(generateDefault(schema), null, 2)
}
