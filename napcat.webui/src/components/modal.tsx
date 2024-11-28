import React from 'react'
import {
  Modal as NextUIModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@nextui-org/modal'
import { Button } from '@nextui-org/button'
export interface ModalProps {
  content: React.ReactNode
  title?: React.ReactNode
  onClose?: () => void
  onConfirm?: () => void
  onCancel?: () => void
  backdrop?: 'opaque' | 'blur' | 'transparent'
  showCancel?: boolean
  dismissible?: boolean
}

const Modal: React.FC<ModalProps> = React.memo((props) => {
  const {
    backdrop = 'blur',
    title,
    content,
    showCancel = true,
    dismissible,
    onClose,
    onConfirm,
    onCancel
  } = props
  const { onClose: onNativeClose } = useDisclosure()

  return (
    <NextUIModal
      defaultOpen
      backdrop={backdrop}
      isDismissable={dismissible}
      onClose={() => {
        onClose?.()
        onNativeClose()
      }}
    >
      <ModalContent>
        {(nativeClose) => (
          <>
            {title && (
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            )}
            <ModalBody>{content}</ModalBody>
            <ModalFooter>
              {showCancel && (
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onCancel?.()
                    nativeClose()
                  }}
                >
                  取消
                </Button>
              )}
              <Button
                color="primary"
                onPress={() => {
                  onConfirm?.()
                  nativeClose()
                }}
              >
                确定
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </NextUIModal>
  )
})

Modal.displayName = 'Modal'

export default Modal
