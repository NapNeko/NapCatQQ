import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Tooltip } from '@heroui/tooltip'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { MdAddPhotoAlternate, MdEdit, MdImage, MdUpload } from 'react-icons/md'

import { isURI } from '@/utils/url'

export interface ImageInsertProps {
  insertImage: (url: string) => void
  onOpenChange: (open: boolean) => void
}

const ImageInsert = ({ insertImage, onOpenChange }: ImageInsertProps) => {
  const [imgUrl, setImgUrl] = useState<string>('')
  const imageInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Popover onOpenChange={onOpenChange}>
        <Tooltip content="插入图片">
          <div className="max-w-fit">
            <PopoverTrigger>
              <Button color="primary" variant="flat" isIconOnly radius="full">
                <MdImage className="text-xl" />
              </Button>
            </PopoverTrigger>
          </div>
        </Tooltip>
        <PopoverContent className="flex-row gap-2 p-4">
          <Tooltip content="上传图片">
            <Button
              className="text-lg"
              color="primary"
              isIconOnly
              variant="flat"
              radius="full"
              onPress={() => {
                imageInputRef?.current?.click()
              }}
            >
              <MdUpload />
            </Button>
          </Tooltip>
          <Popover>
            <Tooltip content="输入图片地址">
              <div className="max-w-fit">
                <PopoverTrigger tooltip="输入图片地址">
                  <Button
                    className="text-lg"
                    color="primary"
                    isIconOnly
                    variant="flat"
                    radius="full"
                  >
                    <MdEdit />
                  </Button>
                </PopoverTrigger>
              </div>
            </Tooltip>
            <PopoverContent className="flex-row gap-1 p-2">
              <Input
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="请输入图片地址"
              />
              <Button
                color="primary"
                variant="flat"
                isIconOnly
                radius="full"
                onPress={() => {
                  if (!isURI(imgUrl)) {
                    toast.error('请输入正确的图片地址')
                    return
                  }
                  insertImage(imgUrl)
                  setImgUrl('')
                }}
              >
                <MdAddPhotoAlternate />
              </Button>
            </PopoverContent>
          </Popover>
        </PopoverContent>
      </Popover>

      <input
        type="file"
        ref={imageInputRef}
        hidden
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) {
            return
          }
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = (event) => {
            const dataURL = event.target?.result
            insertImage(dataURL as string)
            e.target.value = ''
          }
        }}
      />
    </>
  )
}

export default ImageInsert
