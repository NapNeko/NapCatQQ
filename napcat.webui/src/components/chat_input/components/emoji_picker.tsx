import { Button } from '@heroui/button'
import { Image } from '@heroui/image'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Tooltip } from '@heroui/tooltip'
import { data, getUrl } from 'qface'
import { useEffect, useRef, useState } from 'react'
import { MdEmojiEmotions } from 'react-icons/md'

import { EmojiValue } from '../formats/emoji_blot'

const emojis = data.map((item) => {
  return {
    alt: item.QDes,
    src: getUrl(item.QSid),
    id: item.QSid
  } as EmojiValue
})

export interface EmojiPickerProps {
  onInsertEmoji: (emoji: EmojiValue) => void
  onOpenChange: (open: boolean) => void
}

const EmojiPicker = ({ onInsertEmoji, onOpenChange }: EmojiPickerProps) => {
  const [visibleEmojis, setVisibleEmojis] = useState<EmojiValue[]>([])
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (isPopoverOpen) {
      setVisibleEmojis([]) // Reset visible emojis
      requestAnimationFrame(() => loadEmojis()) // Start loading emojis
    }
  }, [isPopoverOpen])

  const loadEmojis = (index = 0, batchSize = 10) => {
    if (index < emojis.length) {
      setVisibleEmojis((prev) => [
        ...prev,
        ...emojis.slice(index, index + batchSize)
      ])
      requestAnimationFrame(() => loadEmojis(index + batchSize, batchSize))
    }
  }
  return (
    <div ref={containerRef}>
      <Popover
        portalContainer={containerRef.current!}
        shouldCloseOnScroll={false}
        placement="right-start"
        onOpenChange={(v) => {
          onOpenChange(v)
          setIsPopoverOpen(v)
        }}
      >
        <Tooltip content="插入表情">
          <div className="max-w-fit">
            <PopoverTrigger>
              <Button color="primary" variant="flat" isIconOnly radius="full">
                <MdEmojiEmotions className="text-xl" />
              </Button>
            </PopoverTrigger>
          </div>
        </Tooltip>
        <PopoverContent className="grid grid-cols-8 gap-1 flex-wrap justify-start items-start overflow-y-auto max-w-full max-h-96 p-2">
          {visibleEmojis.map((emoji) => (
            <Button
              key={emoji.id}
              color="primary"
              variant="flat"
              isIconOnly
              radius="full"
              onPress={() => onInsertEmoji(emoji)}
            >
              <Image src={emoji.src} alt={emoji.alt} className="w-6 h-6" />
            </Button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default EmojiPicker
