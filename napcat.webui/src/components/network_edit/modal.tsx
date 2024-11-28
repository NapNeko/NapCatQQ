import { Modal, ModalContent, ModalHeader } from '@nextui-org/modal'
import toast from 'react-hot-toast'

import HTTPServerForm from './http_server'
import HTTPClientForm from './http_client'
import WebsocketServerForm from './ws_server'
import WebsocketClientForm from './ws_client'

import useConfig from '@/hooks/use-config'

const modalTitle = {
  httpServers: 'HTTP Server',
  httpClients: 'HTTP Client',
  websocketServers: 'Websocket Server',
  websocketClients: 'Websocket Client'
}

export interface NetworkFormModalProps<
  T extends keyof OneBotConfig['network']
> {
  isOpen: boolean
  field: T
  data?: OneBotConfig['network'][T][0]
  onOpenChange: (isOpen: boolean) => void
}

const NetworkFormModal = <T extends keyof OneBotConfig['network']>(
  props: NetworkFormModalProps<T>
) => {
  const { isOpen, onOpenChange, field, data } = props
  const { createNetworkConfig, updateNetworkConfig } = useConfig()
  const isCreate = !data

  const onSubmit = async (data: OneBotConfig['network'][typeof field][0]) => {
    try {
      if (isCreate) {
        await createNetworkConfig(field, data)
      } else {
        await updateNetworkConfig(field, data)
      }
      toast.success('保存配置成功')
    } catch (error) {
      const msg = (error as Error).message

      toast.error(`保存配置失败: ${msg}`)

      throw error
    }
  }

  const getDisplayForm: (
    onClose: () => void,
    configData?: OneBotConfig['network'][typeof field][0]
  ) => JSX.Element = (onClose, configData) => {
    switch (field) {
      case 'httpServers':
        return (
          <HTTPServerForm
            data={configData as OneBotConfig['network']['httpServers'][0]}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )
      case 'httpClients':
        return (
          <HTTPClientForm
            data={configData as OneBotConfig['network']['httpClients'][0]}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )
      case 'websocketServers':
        return (
          <WebsocketServerForm
            data={configData as OneBotConfig['network']['websocketServers'][0]}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )
      case 'websocketClients':
        return (
          <WebsocketClientForm
            data={configData as OneBotConfig['network']['websocketClients'][0]}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )
      default:
        return <></>
    }
  }

  return (
    <Modal
      backdrop="blur"
      isDismissable={false}
      isOpen={isOpen}
      scrollBehavior="outside"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {modalTitle[field]}
            </ModalHeader>
            {getDisplayForm(onClose, data)}
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default NetworkFormModal
