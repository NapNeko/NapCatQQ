import { Button } from '@heroui/button'
import type { Range } from 'quill'
import 'quill/dist/quill.core.css'
import { useRef } from 'react'
import toast from 'react-hot-toast'

import { useCustomQuill } from '@/hooks/use_custom_quill'
import useShowStructuredMessage from '@/hooks/use_show_strcuted_message'

import { quillToMessage } from '@/utils/onebot'

import type { OB11Segment } from '@/types/onebot'

import AudioInsert from './components/audio_insert'
import DiceInsert from './components/dice_insert'
import EmojiPicker from './components/emoji_picker'
import FileInsert from './components/file_insert'
import ImageInsert from './components/image_insert'
import MusicInsert from './components/music_insert'
import ReplyInsert from './components/reply_insert'
import RPSInsert from './components/rps_insert'
import VideoInsert from './components/video_insert'
import EmojiBlot from './formats/emoji_blot'
import type { EmojiValue } from './formats/emoji_blot'
import ImageBlot from './formats/image_blot'
import ReplyBlock from './formats/reply_blot'

const ChatInput = () => {
  const memorizedRange = useRef<Range | null>(null)

  const showStructuredMessage = useShowStructuredMessage()
  const formats: string[] = ['image', 'emoji', 'reply']
  const modules = {
    toolbar: '#toolbar'
  }
  const { quillRef, quill, Quill } = useCustomQuill({
    modules,
    formats,
    placeholder: '请输入消息'
  })

  if (Quill && !quill) {
    Quill.register('formats/emoji', EmojiBlot)
    Quill.register('formats/image', ImageBlot, true)
    Quill.register('formats/reply', ReplyBlock)
  }

  if (quill) {
    quill.on('selection-change', (range) => {
      if (range) {
        const editorContent = quill.getContents()
        const firstOp = editorContent.ops[0]

        if (
          typeof firstOp?.insert !== 'string' &&
          firstOp?.insert?.reply &&
          range.index === 0 &&
          range.length !== quill.getLength()
        ) {
          quill.setSelection(1, Quill.sources.SILENT)
        }
      }
    })

    quill.on('text-change', () => {
      const editorContent = quill.getContents()
      const firstOp = editorContent.ops[0]
      if (
        firstOp &&
        typeof firstOp.insert !== 'string' &&
        firstOp.insert?.reply &&
        quill.getLength() === 1
      ) {
        quill.insertText(1, '\n', Quill.sources.SILENT)
      }
    })

    quill.on('editor-change', (eventName: string) => {
      if (eventName === 'text-change') {
        const editorContent = quill.getContents()
        const firstOp = editorContent.ops[0]
        if (
          firstOp &&
          typeof firstOp.insert !== 'string' &&
          firstOp.insert?.reply &&
          quill.getLength() === 1
        ) {
          quill.insertText(1, '\n', Quill.sources.SILENT)
        }
      }
    })

    quill.root.addEventListener('compositionstart', () => {
      const editorContent = quill.getContents()
      const firstOp = editorContent.ops[0]
      if (
        firstOp &&
        typeof firstOp.insert !== 'string' &&
        firstOp.insert?.reply &&
        quill.getLength() === 1
      ) {
        quill.insertText(1, '\n', Quill.sources.SILENT)
      }
    })
  }

  const onOpenChange = (open: boolean) => {
    if (open) {
      const selection = quill?.getSelection()
      if (selection) memorizedRange.current = selection
    }
  }

  const insertImage = (url: string) => {
    const selection = memorizedRange.current || quill?.getSelection()
    quill?.deleteText(selection?.index || 0, selection?.length || 0)
    quill?.insertEmbed(selection?.index || 0, 'image', {
      src: url,
      alt: '图片'
    })
    quill?.setSelection((selection?.index || 0) + 1, 0)
  }
  function insertReplyBlock(messageId: string) {
    const isNumberReg = /^(?:0|(?:-?[1-9]\d*))$/
    if (!isNumberReg.test(messageId)) {
      toast.error('请输入正确的消息ID')
      return
    }
    const editorContent = quill?.getContents()
    const firstOp = editorContent?.ops[0]
    const currentSelection = quill?.getSelection()
    if (
      firstOp &&
      typeof firstOp.insert !== 'string' &&
      firstOp.insert?.reply
    ) {
      const delta = quill?.getContents()
      if (delta) {
        delta.ops[0] = {
          insert: { reply: { messageId } }
        }
        quill?.setContents(delta, Quill.sources.USER)
      }
    } else {
      quill?.insertEmbed(0, 'reply', { messageId }, Quill.sources.USER)
    }
    quill?.setSelection((currentSelection?.index || 0) + 1, 0)
    quill?.blur()
  }
  const onInsertEmoji = (emoji: EmojiValue) => {
    const selection = memorizedRange.current || quill?.getSelection()
    quill?.deleteText(selection?.index || 0, selection?.length || 0)
    quill?.insertEmbed(selection?.index || 0, 'emoji', {
      alt: emoji.alt,
      src: emoji.src,
      id: emoji.id
    })
    quill?.setSelection((selection?.index || 0) + 1, 0)
  }

  const getChatMessage = () => {
    const delta = quill?.getContents()
    const ops =
      delta?.ops?.filter((op) => {
        return op.insert !== '\n'
      }) ?? []
    const messages: OB11Segment[] = ops.map((op) => {
      return quillToMessage(op)
    })
    return messages
  }

  return (
    <div>
      <div
        ref={quillRef}
        className="border border-default-200 rounded-md !mb-2 !text-base !h-64"
      />
      <div id="toolbar" className="!border-none flex gap-2">
        <ImageInsert insertImage={insertImage} onOpenChange={onOpenChange} />
        <EmojiPicker
          onInsertEmoji={onInsertEmoji}
          onOpenChange={onOpenChange}
        />
        <ReplyInsert insertReply={insertReplyBlock} />
        <FileInsert />
        <AudioInsert />
        <VideoInsert />
        <MusicInsert />
        <DiceInsert />
        <RPSInsert />
        <Button
          color="primary"
          onPress={() => {
            const messages = getChatMessage()
            showStructuredMessage(messages)
          }}
          className="ml-auto"
        >
          获取JSON格式
        </Button>
      </div>
    </div>
  )
}

export default ChatInput
