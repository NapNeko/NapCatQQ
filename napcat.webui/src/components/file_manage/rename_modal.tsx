import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/modal'

interface RenameModalProps {
  isOpen: boolean
  newFileName: string
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClose: () => void
  onRename: () => void
}

export default function RenameModal({
  isOpen,
  newFileName,
  onNameChange,
  onClose,
  onRename
}: RenameModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>重命名</ModalHeader>
        <ModalBody>
          <Input label="新名称" value={newFileName} onChange={onNameChange} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="flat" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={onRename}>
            确定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
