import clsx from 'clsx'
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

import { useTheme } from '@/hooks/use-theme'

export interface AddButtonProps {
  onOpen: (key: keyof OneBotConfig['network']) => void
}

const AddButton: React.FC<AddButtonProps> = (props) => {
  const { onOpen } = props
  const { isDark } = useTheme()

  return (
    <Dropdown
      classNames={{
        content: 'bg-opacity-10 backdrop-blur-sm'
      }}
      placement="right"
    >
      <DropdownTrigger>
        <div
          className={clsx(
            'rounded-lg border-3 border-dotted border-primary-400 flex flex-col justify-center items-center gap-2 py-5 px-14 text-primary-400 transition hover:bg-primary-50 active:bg-primary-100 md:cursor-pointer select-none shadow-md',
            isDark
              ? 'bg-primary-50 bg-opacity-30'
              : 'bg-primary-100 bg-opacity-10'
          )}
        >
          <div className="w-10 h-10">
            <PlusIcon />
          </div>
        </div>
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
