import { Chip } from '@heroui/chip'
import { Tooltip } from '@heroui/tooltip'
import { motion } from 'motion/react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { TbSquareRoundedChevronRightFilled } from 'react-icons/tb'

import type { LiteralValue, ParsedSchema } from '@/utils/zod'

interface DisplayStructProps {
  schema: ParsedSchema | ParsedSchema[]
}

const SchemaType = ({
  type,
  value
}: {
  type: string
  value?: LiteralValue
}) => {
  let name = type
  switch (type) {
    case 'union':
      name = '联合类型'
      break
    case 'value':
      name = '固定值'
      break
  }
  let chipColor: 'primary' | 'success' | 'primary' | 'warning' | 'secondary' =
    'primary'
  switch (type) {
    case 'enum':
      chipColor = 'warning'
      break
    case 'union':
      chipColor = 'secondary'
      break
    case 'array':
      chipColor = 'primary'
      break
    case 'object':
      chipColor = 'success'
      break
  }

  return (
    <Chip size="sm" color={chipColor} variant="flat">
      {name}
      {type === 'value' && (
        <span className="px-1 rounded-full bg-primary-400 text-white ml-1">
          {value}
        </span>
      )}
    </Chip>
  )
}

const SchemaLabel: React.FC<{
  schema: ParsedSchema
}> = ({ schema }) => (
  <>
    {Array.isArray(schema.type) ? (
      schema.type.map((type) => (
        <SchemaType key={type} type={type} value={schema?.value} />
      ))
    ) : (
      <SchemaType type={schema.type} value={schema?.value} />
    )}
    {schema.optional && (
      <Chip size="sm" color="default" variant="flat">
        可选
      </Chip>
    )}
    {schema.description && (
      <span className="text-xs text-default-400">{schema.description}</span>
    )}
  </>
)

const SchemaContainer: React.FC<{
  schema: ParsedSchema
  children: React.ReactNode
}> = ({ schema, children }) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => setExpanded(!expanded)

  return (
    <div className="mb-2">
      <div
        onClick={toggleExpand}
        className="md:cursor-pointer flex items-center gap-1"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: expanded ? 90 : 0 }}
        >
          <TbSquareRoundedChevronRightFilled />
        </motion.div>
        <Tooltip content="点击复制" placement="top" showArrow>
          <span
            className="border-b border-transparent border-dashed hover:border-primary-400"
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(schema.name || '')
              toast.success('已复制')
            }}
          >
            {schema.name}
          </span>
        </Tooltip>
        <SchemaLabel schema={schema} />
      </div>
      <motion.div
        className="ml-5 overflow-hidden"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: expanded ? 1 : 0, height: expanded ? 'auto' : 0 }}
      >
        <div className="h-2"></div>
        {children}
      </motion.div>
    </div>
  )
}

const RenderSchema: React.FC<{ schema: ParsedSchema }> = ({ schema }) => {
  if (schema.type === 'object') {
    return (
      <SchemaContainer schema={schema}>
        {schema.children && schema.children.length > 0 ? (
          schema.children.map((child, i) => (
            <RenderSchema key={child.name || i} schema={child} />
          ))
        ) : (
          <div>{`{}`}</div>
        )}
      </SchemaContainer>
    )
  }

  if (schema.type === 'array' || schema.type === 'union') {
    return (
      <SchemaContainer schema={schema}>
        {schema.children?.map((child, i) => (
          <RenderSchema key={child.name || i} schema={child} />
        ))}
      </SchemaContainer>
    )
  }

  if (schema.type === 'enum' && Array.isArray(schema.enum)) {
    return (
      <SchemaContainer schema={schema}>
        <div className="flex gap-1 items-center">
          {schema.enum?.map((value, i) => (
            <Chip
              key={value?.toString() || i}
              size="sm"
              variant="flat"
              color="success"
            >
              {value?.toString()}
            </Chip>
          ))}
        </div>
      </SchemaContainer>
    )
  }

  return (
    <div className="mb-2 flex items-center gap-1 pl-5">
      <Tooltip content="点击复制" placement="top" showArrow>
        <span
          className="border-b border-transparent border-dashed hover:border-primary-400 md:cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard.writeText(schema.name || '')
            toast.success('已复制')
          }}
        >
          {schema.name}
        </span>
      </Tooltip>
      <SchemaLabel schema={schema} />
    </div>
  )
}

const DisplayStruct: React.FC<DisplayStructProps> = ({ schema }) => {
  return (
    <div className="p-4 bg-content2 rounded-lg bg-opacity-50">
      {Array.isArray(schema) ? (
        schema.map((s, i) => <RenderSchema key={s.name || i} schema={s} />)
      ) : (
        <RenderSchema schema={schema} />
      )}
    </div>
  )
}

export default DisplayStruct
