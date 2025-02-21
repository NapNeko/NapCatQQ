import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { useRef, useState } from 'react'

export interface FileInputProps {
  onChange: (file: File) => Promise<void> | void
  onDelete?: () => Promise<void> | void
  label?: string
  accept?: string
}

const FileInput: React.FC<FileInputProps> = ({
  onChange,
  onDelete,
  label,
  accept
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  return (
    <div className="flex items-end gap-2">
      <div className="flex-grow">
        <Input
          isDisabled={isLoading}
          ref={inputRef}
          label={label}
          type="file"
          placeholder="选择文件"
          accept={accept}
          onChange={async (e) => {
            try {
              setIsLoading(true)
              const file = e.target.files?.[0]
              if (file) {
                await onChange(file)
              }
            } catch (error) {
              console.error(error)
            } finally {
              setIsLoading(false)
              if (inputRef.current) inputRef.current.value = ''
            }
          }}
        />
      </div>
      <Button
        isDisabled={isLoading}
        onPress={async () => {
          try {
            setIsLoading(true)
            if (onDelete) await onDelete()
          } catch (error) {
            console.error(error)
          } finally {
            setIsLoading(false)
            if (inputRef.current) inputRef.current.value = ''
          }
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

export default FileInput
