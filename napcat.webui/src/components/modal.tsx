import { Button } from '@heroui/button'
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Modal as NextUIModal,
  useDisclosure
} from '@heroui/modal'
import React from 'react'

export interface ModalProps {
  content: React.ReactNode
  title?: React.ReactNode
  size?: React.ComponentProps<typeof NextUIModal>['size']
  scrollBehavior?: React.ComponentProps<typeof NextUIModal>['scrollBehavior']
  onClose?: () => void
  onConfirm?: () => void
  onCancel?: () => void
  backdrop?: 'opaque' | 'blur' | 'transparent'
  showCancel?: boolean
  dismissible?: boolean
  confirmText?: string
  cancelText?: string
}

const Modal: React.FC<ModalProps> = React.memo((props) => {
  const {
    backdrop = 'blur',
    title,
    content,
    showCancel = true,
    dismissible,
    confirmText = '确定',
    cancelText = '取消',
    onClose,
    onConfirm,
    onCancel,
    ...rest
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
      classNames={{
        backdrop: 'z-[99]',
        wrapper: 'z-[99]'
      }}
      {...rest}
    >
      <ModalContent>
        {(nativeClose) => (
          <>
            {title && (
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            )}
            <ModalBody className="break-all">{content}</ModalBody>
            <ModalFooter>
              {showCancel && (
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => {
                    onCancel?.()
                    nativeClose()
                  }}
                >
                  {cancelText}
                </Button>
              )}
              <Button
                color="primary"
                onPress={() => {
                  onConfirm?.()
                  nativeClose()
                }}
              >
                {confirmText}
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
