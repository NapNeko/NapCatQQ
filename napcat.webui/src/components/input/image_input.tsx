import { Button } from '@heroui/button'
import { Image } from '@heroui/image'
import { Input } from '@heroui/input'
import { useRef } from 'react'

export interface ImageInputProps {
  onChange: (base64: string) => void
  value: string
  label?: string
}

const ImageInput: React.FC<ImageInputProps> = ({ onChange, value, label }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="flex items-end gap-2">
      <div className="w-5 h-5 flex-shrink-0">
        <Image
          src={value}
          alt={label}
          className="w-5 h-5 flex-shrink-0 rounded-none"
        />
      </div>
      <Input
        ref={inputRef}
        label={label}
        type="file"
        placeholder="选择图片"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = async () => {
              const base64 = reader.result as string
              onChange(base64)
            }
            reader.readAsDataURL(file)
          }
        }}
      />
      <Button
        onPress={() => {
          onChange('')
          if (inputRef.current) inputRef.current.value = ''
        }}
        color="primary"
        variant="flat"
        size="sm"
      >
        删除
      </Button>
    </div>
  )
}

export default ImageInput
