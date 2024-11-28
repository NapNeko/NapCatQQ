// Dialog Context
import type { ModalProps } from '@/components/modal'

import React from 'react'

import Modal from '@/components/modal'

interface AlertProps {
  title?: React.ReactNode
  content: React.ReactNode
  dismissible?: boolean
  onConfirm?: () => void
}

interface ConfirmProps {
  title?: React.ReactNode
  content: React.ReactNode
  dismissible?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

interface ModalItem extends ModalProps {
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
    const { title, content, dismissible, onConfirm } = config

    setDialogs((before) => {
      const id = before[before.length - 1]?.id + 1 || 0

      return [
        ...before,
        {
          id,
          content,
          title,
          backdrop: 'blur',
          showCancel: false,
          dismissible: dismissible,
          onCancel: () => {
            onConfirm?.()
            setDialogs((before) => before.filter((item) => item.id !== id))
          }
        }
      ]
    })
  }

  const confirm = (config: ConfirmProps) => {
    const { title, content, dismissible, onConfirm, onCancel } = config

    setDialogs((before) => {
      const id = before[before.length - 1]?.id + 1 || 0

      return [
        ...before,
        {
          id,
          content,
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
