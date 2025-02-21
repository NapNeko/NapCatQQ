import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Tooltip } from '@heroui/tooltip'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { IoVideocam } from 'react-icons/io5'
import { MdEdit, MdUpload } from 'react-icons/md'
import { TbVideoPlus } from 'react-icons/tb'

import useShowStructuredMessage from '@/hooks/use_show_strcuted_message'

import { isURI } from '@/utils/url'

import type { OB11Segment } from '@/types/onebot'

const VideoInsert = () => {
  const [videoUrl, setVideoUrl] = useState<string>('')
  const videoInputRef = useRef<HTMLInputElement>(null)
  const showStructuredMessage = useShowStructuredMessage()
  const showVideoSegment = (file: string) => {
    const messages: OB11Segment[] = [
      {
        type: 'video',
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
        <Tooltip content="发送视频">
          <div className="max-w-fit">
            <PopoverTrigger>
              <Button color="primary" variant="flat" isIconOnly radius="full">
                <IoVideocam className="text-xl" />
              </Button>
            </PopoverTrigger>
          </div>
        </Tooltip>
        <PopoverContent className="flex-row gap-2 p-4">
          <Tooltip content="上传视频">
            <Button
              className="text-lg"
              color="primary"
              isIconOnly
              variant="flat"
              radius="full"
              onPress={() => {
                videoInputRef?.current?.click()
              }}
            >
              <MdUpload />
            </Button>
          </Tooltip>
          <Popover>
            <Tooltip content="输入视频地址">
              <div className="max-w-fit">
                <PopoverTrigger tooltip="输入视频地址">
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
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="请输入视频地址"
              />
              <Button
                color="primary"
                variant="flat"
                isIconOnly
                radius="full"
                onPress={() => {
                  if (!isURI(videoUrl)) {
                    toast.error('请输入正确的视频地址')
                    return
                  }
                  showVideoSegment(videoUrl)
                  setVideoUrl('')
                }}
              >
                <TbVideoPlus />
              </Button>
            </PopoverContent>
          </Popover>
        </PopoverContent>
      </Popover>

      <input
        type="file"
        ref={videoInputRef}
        hidden
        accept="video/*"
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
            showVideoSegment(dataURL as string)
            e.target.value = ''
          }
        }}
      />
    </>
  )
}

export default VideoInsert
