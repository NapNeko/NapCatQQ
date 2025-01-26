// Dialog Context
import React from 'react'

import Modal from '@/components/modal'
import type { ModalProps } from '@/components/modal'

export interface AlertProps
  extends Omit<ModalProps, 'onCancel' | 'showCancel' | 'cancelText'> {
  onConfirm?: () => void
}

export interface ConfirmProps extends ModalProps {
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
    const { onConfirm, size = 'md', ...rest } = config

    setDialogs((before) => {
      const id = before[before.length - 1]?.id + 1 || 0

      return [
        ...before,
        {
          id,
          size,
          backdrop: 'blur',
          showCancel: false,
          onConfirm: () => {
            onConfirm?.()
            setTimeout(() => {
              setDialogs((before) => before.filter((item) => item.id !== id))
            }, 300)
          },
          ...rest
        }
      ]
    })
  }

  const confirm = (config: ConfirmProps) => {
    const { onConfirm, onCancel, size = 'md', ...rest } = config

    setDialogs((before) => {
      const id = before[before.length - 1]?.id + 1 || 0

      return [
        ...before,
        {
          id,
          size,
          backdrop: 'blur',
          showCancel: true,
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
          },
          ...rest
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
