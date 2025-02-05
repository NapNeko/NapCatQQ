import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Tooltip } from '@heroui/tooltip'
import { useState } from 'react'
import { BsChatQuoteFill } from 'react-icons/bs'
import { MdAdd } from 'react-icons/md'

export interface ReplyInsertProps {
  insertReply: (messageId: string) => void
}

const ReplyInsert = ({ insertReply }: ReplyInsertProps) => {
  const [replyId, setReplyId] = useState<string>('')

  return (
    <>
      <Popover>
        <Tooltip content="回复消息">
          <div className="max-w-fit">
            <PopoverTrigger>
              <Button color="primary" variant="flat" isIconOnly radius="full">
                <BsChatQuoteFill className="text-lg" />
              </Button>
            </PopoverTrigger>
          </div>
        </Tooltip>
        <PopoverContent className="flex-row gap-2 p-4">
          <Input
            placeholder="输入消息 ID"
            value={replyId}
            onChange={(e) => {
              const value = e.target.value
              const isNumberReg = /^(?:0|(?:-?[1-9]\d*))$/
              if (isNumberReg.test(value)) {
                setReplyId(value)
              }
            }}
          />
          <Button
            color="primary"
            variant="flat"
            radius="full"
            isIconOnly
            onPress={() => {
              insertReply(replyId)
              setReplyId('')
            }}
          >
            <MdAdd />
          </Button>
        </PopoverContent>
      </Popover>
    </>
  )
}

export default ReplyInsert
