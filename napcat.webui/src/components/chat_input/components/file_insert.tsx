import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Tooltip } from '@heroui/tooltip'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaFolder } from 'react-icons/fa6'
import { LuFilePlus2 } from 'react-icons/lu'
import { MdEdit, MdUpload } from 'react-icons/md'

import useShowStructuredMessage from '@/hooks/use_show_strcuted_message'

import { isURI } from '@/utils/url'

import type { OB11Segment } from '@/types/onebot'

const FileInsert = () => {
  const [fileUrl, setFileUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const showStructuredMessage = useShowStructuredMessage()
  const showFileSegment = (file: string) => {
    const messages: OB11Segment[] = [
      {
        type: 'file',
        data: {
          file: file
        }
      }
    ]
    showStructuredMessage(messages)
  }
  return (
    <>
      <Popover>
        <Tooltip content="发送文件">
          <div className="max-w-fit">
            <PopoverTrigger>
              <Button color="primary" variant="flat" isIconOnly radius="full">
                <FaFolder className="text-lg" />
              </Button>
            </PopoverTrigger>
          </div>
        </Tooltip>
        <PopoverContent className="flex-row gap-2 p-4">
          <Tooltip content="上传文件">
            <Button
              className="text-lg"
              color="primary"
              isIconOnly
              variant="flat"
              radius="full"
              onPress={() => {
                fileInputRef?.current?.click()
              }}
            >
              <MdUpload />
            </Button>
          </Tooltip>
          <Popover>
            <Tooltip content="输入文件地址">
              <div className="max-w-fit">
                <PopoverTrigger tooltip="输入文件地址">
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
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="请输入文件地址"
              />
              <Button
                color="primary"
                variant="flat"
                isIconOnly
                radius="full"
                onPress={() => {
                  if (!isURI(fileUrl)) {
                    toast.error('请输入正确的文件地址')
                    return
                  }
                  showFileSegment(fileUrl)
                  setFileUrl('')
                }}
              >
                <LuFilePlus2 />
              </Button>
            </PopoverContent>
          </Popover>
        </PopoverContent>
      </Popover>

      <input
        type="file"
        ref={fileInputRef}
        hidden
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
            showFileSegment(dataURL as string)
            e.target.value = ''
          }
        }}
      />
    </>
  )
}

export default FileInsert
