import { Button } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/modal'
import { useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

import ChatInputModal from '@/components/chat_input/modal'
import CodeEditor from '@/components/code_editor'
import type { CodeEditorRef } from '@/components/code_editor'

export interface OneBotSendModalProps {
  sendMessage: (msg: string) => void
}

const OneBotSendModal: React.FC<OneBotSendModalProps> = (props) => {
  const { sendMessage } = props
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const editorRef = useRef<CodeEditorRef | null>(null)

  const handleSendMessage = useCallback(
    (onClose: () => void) => {
      const msg = editorRef.current?.getValue()
      if (!msg) {
        toast.error('消息不能为空')
        return
      }
      try {
        sendMessage(msg)
        toast.success('消息发送成功')
        onClose()
      } catch (error) {
        toast.error('消息发送失败')
      }
    },
    [sendMessage]
  )

  return (
    <>
      <Button onPress={onOpen} color="primary" radius="full" variant="flat">
        构造请求
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        size="5xl"
        scrollBehavior="outside"
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                构造请求
              </ModalHeader>
              <ModalBody>
                <div className="h-96 dark:bg-[rgb(30,30,30)] p-2 rounded-md border border-default-100">
                  <CodeEditor
                    height="100%"
                    defaultLanguage="json"
                    defaultValue={`{
  "action": "get_group_list"
}`}
                    ref={editorRef}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <ChatInputModal />

                <Button color="primary" variant="flat" onPress={onClose}>
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSendMessage(onClose)}
                >
                  发送
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
export default OneBotSendModal
