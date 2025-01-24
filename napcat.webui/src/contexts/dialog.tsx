// Dialog Context
import React from 'react'

import type { ModalProps } from '@/components/modal'
import Modal from '@/components/modal'

export interface AlertProps {
  title?: React.ReactNode
  content: React.ReactNode
  size?: ModalProps['size']
  dismissible?: boolean
  onConfirm?: () => void
}

export interface ConfirmProps {
  title?: React.ReactNode
  content: React.ReactNode
  size?: ModalProps['size']
  dismissible?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

export interface ModalItem extends ModalProps {
  id: number
}

export interface DialogContextProps {
  alert: (config: AlertProps) => void
  confirm: (config: ConfirmProps) => void
}

export interface DialogProviderProps {
  children: React.ReactNode
}

export const DialogContext = React.createContext<DialogContextProps>({
  alert: () => {},
  confirm: () => {}
})

const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [dialogs, setDialogs] = React.useState<ModalItem[]>([])
  const alert = (config: AlertProps) => {
    const { title, content, dismissible, onConfirm, size = 'md' } = config

    setDialogs((before) => {
      const id = before[before.length - 1]?.id + 1 || 0

      return [
        ...before,
        {
          id,
          content,
          size,
          title,
          backdrop: 'blur',
          showCancel: false,
          dismissible: dismissible,
          onConfirm: () => {
            onConfirm?.()
            setTimeout(() => {
              setDialogs((before) => before.filter((item) => item.id !== id))
            }, 300)
          }
        }
      ]
    })
  }

  const confirm = (config: ConfirmProps) => {
    const {
      title,
      content,
      dismissible,
      onConfirm,
      onCancel,
      size = 'md'
    } = config

    setDialogs((before) => {
      const id = before[before.length - 1]?.id + 1 || 0

      return [
        ...before,
        {
          id,
          content,
          size,
          title,
          backdrop: 'blur',
          showCancel: true,
          dismissible: dismissible,
          onConfirm: () => {
            onConfirm?.()
            setTimeout(() => {
              setDialogs((before) => before.filter((item) => item.id !== id))
            }, 300)
          },
          onCancel: () => {
            onCancel?.()
            setTimeout(() => {
              setDialogs((before) => before.filter((item) => item.id !== id))
            }, 300)
          }
        }
      ]
    })
  }

  return (
    <DialogContext.Provider
      value={{
        alert,
        confirm
      }}
    >
      {children}
      {dialogs?.map(({ id, ...props }) => <Modal key={id} {...props} />)}
    </DialogContext.Provider>
  )
}

export default DialogProvider
