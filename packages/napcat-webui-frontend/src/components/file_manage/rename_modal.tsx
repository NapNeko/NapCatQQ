import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';

interface RenameModalProps {
  isOpen: boolean;
  newFileName: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onRename: () => void;
}

export default function RenameModal ({
  isOpen,
  newFileName,
  onNameChange,
  onClose,
  onRename,
}: RenameModalProps) {
  return (
    <Modal radius='sm' isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>重命名</ModalHeader>
        <ModalBody>
          <Input radius='sm' label='新名称' value={newFileName} onChange={onNameChange} />
        </ModalBody>
        <ModalFooter>
          <Button radius='sm' color='primary' variant='flat' onPress={onClose}>
            取消
          </Button>
          <Button radius='sm' color='primary' onPress={onRename}>
            确定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
