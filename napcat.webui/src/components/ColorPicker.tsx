import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import React from 'react'
import { ColorResult, SketchPicker } from 'react-color'

// 假定 heroui 提供的 Popover组件

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const handleChange = (colorResult: ColorResult) => {
    const hsl = colorResult.hsl
    const color = `${hsl.h} ${hsl.s}% ${hsl.l}%`
    onChange(color)
  }

  return (
    <Popover>
      <PopoverTrigger>
        <div
          style={{
            background: color,
            width: 36,
            height: 14,
            borderRadius: 2,
            cursor: 'pointer',
            border: '1px solid #ddd'
          }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <SketchPicker color={color} onChange={handleChange} />
      </PopoverContent>
    </Popover>
  )
}

export default ColorPicker
