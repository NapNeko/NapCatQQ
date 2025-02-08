import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import React from 'react'
import { ColorResult, SketchPicker } from 'react-color'

// 假定 heroui 提供的 Popover组件

interface ColorPickerProps {
  color: string
  onChange: (color: ColorResult) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const handleChange = (colorResult: ColorResult) => {
    onChange(colorResult)
  }

  return (
    <Popover triggerScaleOnOpen={false}>
      <PopoverTrigger>
        <div
          className="w-36 h-8 rounded-md cursor-pointer border border-content4"
          style={{ background: color }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <SketchPicker
          color={color}
          onChange={handleChange}
          className="!bg-transparent !shadow-none"
        />
      </PopoverContent>
    </Popover>
  )
}

export default ColorPicker
