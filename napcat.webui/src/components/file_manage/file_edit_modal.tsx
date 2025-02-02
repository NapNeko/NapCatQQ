import { Button } from '@heroui/button'
import { Code } from '@heroui/code'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/modal'

import CodeEditor from '@/components/code_editor'

interface FileEditModalProps {
  isOpen: boolean
  file: { path: string; content: string } | null
  onClose: () => void
  onSave: () => void
  onContentChange: (newContent?: string) => void
}

export default function FileEditModal({
  isOpen,
  file,
  onClose,
  onSave,
  onContentChange
}: FileEditModalProps) {
  return (
    <Modal size="full" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-content2 bg-opacity-50">
          <span>编辑文件</span>
          <Code className="text-xs">{file?.path}</Code>
        </ModalHeader>
        <ModalBody className="p-0">
          <div className="h-full">
            <CodeEditor
              height="100%"
              value={file?.content || ''}
              onChange={onContentChange}
              options={{ wordWrap: 'on' }}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="flat" onPress={onClose}>
            取消
          </Button>
          <Button color="danger" onPress={onSave}>
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
