import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/dropdown'

import {
  HTTPClientIcon,
  HTTPServerIcon,
  PCIcon,
  PlusIcon,
  WebsocketIcon
} from './icons'

import { Button } from '@nextui-org/button'
import { IoAddCircleOutline } from 'react-icons/io5'

export interface AddButtonProps {
  onOpen: (key: keyof OneBotConfig['network']) => void
}

const AddButton: React.FC<AddButtonProps> = (props) => {
  const { onOpen } = props

  return (
    <Dropdown
      classNames={{
        content: 'bg-opacity-30 backdrop-blur-md'
      }}
      placement="right"
    >
      <DropdownTrigger>
        <Button
          color="danger"
          startContent={<IoAddCircleOutline className="text-2xl" />}
        >
          新建
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Create Network Config"
        color="primary"
        variant="flat"
        onAction={(key) => {
          onOpen(key as keyof OneBotConfig['network'])
        }}
      >
        <DropdownItem
          key="title"
          isReadOnly
          className="cursor-default"
          textValue="title"
        >
          <div className="flex items-center gap-2 justify-center">
            <div className="w-5 h-5 -ml-3">
              <PlusIcon />
            </div>
            <div className="text-primary-400">新建网络配置</div>
          </div>
        </DropdownItem>
        <DropdownItem
          key="httpServers"
          startContent={
            <div className="w-6 h-6">
              <HTTPServerIcon />
            </div>
          }
        >
          HTTP服务器
        </DropdownItem>
        <DropdownItem
          key="httpClients"
          startContent={
            <div className="w-6 h-6">
              <HTTPClientIcon />
            </div>
          }
        >
          HTTP客户端
        </DropdownItem>
        <DropdownItem
          key="websocketServers"
          startContent={
            <div className="w-6 h-6">
              <WebsocketIcon />
            </div>
          }
        >
          Websocket服务器
        </DropdownItem>
        <DropdownItem
          key="websocketClients"
          startContent={
            <div className="w-6 h-6">
              <PCIcon />
            </div>
          }
        >
          Websocket客户端
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default AddButton
