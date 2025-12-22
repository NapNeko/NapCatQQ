import { Button } from '@heroui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/modal';

import ChatInput from '.';

interface ChatInputModalProps {
  children?: (onOpen: () => void) => React.ReactNode;
}

export default function ChatInputModal ({ children }: ChatInputModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      {children ? children(onOpen) : (
        <Button
          onPress={onOpen}
          color='primary'
          radius='full'
          variant='flat'
          size='sm'
          className="bg-primary/10 text-primary"
        >
          构造消息
        </Button>
      )}
      <Modal
        size='4xl'
        scrollBehavior='inside'
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                构造消息
              </ModalHeader>
              <ModalBody className='overflow-y-auto'>
                <div className='overflow-y-auto'>
                  <ChatInput />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='primary' onPress={onClose} variant='flat'>
                  关闭
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
