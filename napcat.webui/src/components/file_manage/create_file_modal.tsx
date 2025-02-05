import { Button, ButtonGroup } from '@heroui/button'
import { Input } from '@heroui/input'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/modal'

interface CreateFileModalProps {
  isOpen: boolean
  fileType: 'file' | 'directory'
  newFileName: string
  onTypeChange: (type: 'file' | 'directory') => void
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClose: () => void
  onCreate: () => void
}

export default function CreateFileModal({
  isOpen,
  fileType,
  newFileName,
  onTypeChange,
  onNameChange,
  onClose,
  onCreate
}: CreateFileModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>新建</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <ButtonGroup color="primary">
              <Button
                variant={fileType === 'file' ? 'solid' : 'flat'}
                onPress={() => onTypeChange('file')}
              >
                文件
              </Button>
              <Button
                variant={fileType === 'directory' ? 'solid' : 'flat'}
                onPress={() => onTypeChange('directory')}
              >
                目录
              </Button>
            </ButtonGroup>
            <Input label="名称" value={newFileName} onChange={onNameChange} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="flat" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={onCreate}>
            创建
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
