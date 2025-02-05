import { Button } from '@heroui/button'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/dropdown'
import { Tooltip } from '@heroui/tooltip'
import { FaRegCircleQuestion } from 'react-icons/fa6'
import { IoAddCircleOutline } from 'react-icons/io5'

import {
  HTTPClientIcon,
  HTTPServerIcon,
  PCIcon,
  PlusIcon,
  WebsocketIcon
} from '../icons'

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
          color="primary"
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
          className="cursor-default hover:!bg-transparent"
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
          textValue="httpServers"
          startContent={
            <div className="w-6 h-6">
              <HTTPServerIcon />
            </div>
          }
        >
          <div className="flex gap-1 items-center">
            HTTP服务器
            <Tooltip
              content="「由NapCat建立」一个HTTP服务器，你可以「使用框架连接」此服务器或者「自己构造请求发送」至此服务器。NapCat会根据你配置的IP和端口等建立一个地址，你或者你的框架应该连接到这个地址。"
              showArrow
              className="max-w-64"
            >
              <Button
                isIconOnly
                radius="full"
                size="sm"
                variant="light"
                className="w-4 h-4 min-w-0"
              >
                <FaRegCircleQuestion />
              </Button>
            </Tooltip>
          </div>
        </DropdownItem>
        <DropdownItem
          key="httpSseServers"
          textValue="httpSseServers"
          startContent={
            <div className="w-6 h-6">
              <HTTPServerIcon />
            </div>
          }
        >
          <div className="flex gap-1 items-center">
            HTTP SSE服务器
            <Tooltip
              content="「由NapCat建立」一个HTTP SSE服务器，你可以「使用框架连接」此服务器或者「自己构造请求发送」至此服务器。NapCat会根据你配置的IP和端口等建立一个地址，你或者你的框架应该连接到这个地址。"
              showArrow
              className="max-w-64"
            >
              <Button
                isIconOnly
                radius="full"
                size="sm"
                variant="light"
                className="w-4 h-4 min-w-0"
              >
                <FaRegCircleQuestion />
              </Button>
            </Tooltip>
          </div>
        </DropdownItem>
        <DropdownItem
          key="httpClients"
          textValue="httpClients"
          startContent={
            <div className="w-6 h-6">
              <HTTPClientIcon />
            </div>
          }
        >
          <div className="flex gap-1 items-center">
            HTTP客户端
            <Tooltip
              content="「由框架或者你自己建立」的一个用于「接收」NapCat向你发送请求的客户端，通常框架会提供一个HTTP地址。这个地址是你使用的框架提供的，NapCat会主动连接它。"
              showArrow
              className="max-w-64"
            >
              <Button
                isIconOnly
                radius="full"
                size="sm"
                variant="light"
                className="w-4 h-4 min-w-0"
              >
                <FaRegCircleQuestion />
              </Button>
            </Tooltip>
          </div>
        </DropdownItem>
        <DropdownItem
          key="websocketServers"
          textValue="websocketServers"
          startContent={
            <div className="w-6 h-6">
              <WebsocketIcon />
            </div>
          }
        >
          <div className="flex gap-1 items-center">
            Websocket服务器
            <Tooltip
              content="「由NapCat建立」一个WebSocket服务器，你的框架应该连接到此服务器。NapCat会根据你配置的IP和端口等建立一个WebSocket地址，你或者你的框架应该连接到这个地址。"
              showArrow
              className="max-w-64"
            >
              <Button
                isIconOnly
                radius="full"
                size="sm"
                variant="light"
                className="w-4 h-4 min-w-0"
              >
                <FaRegCircleQuestion />
              </Button>
            </Tooltip>
          </div>
        </DropdownItem>
        <DropdownItem
          key="websocketClients"
          textValue="websocketClients"
          startContent={
            <div className="w-6 h-6">
              <PCIcon />
            </div>
          }
        >
          <div className="flex gap-1 items-center">
            Websocket客户端
            <Tooltip
              content="「由框架或者你自己建立」的WebSocket，通常框架会「提供」一个ws地址，NapCat会主动连接它。"
              showArrow
              className="max-w-64"
            >
              <Button
                isIconOnly
                radius="full"
                size="sm"
                variant="light"
                className="w-4 h-4 min-w-0"
              >
                <FaRegCircleQuestion />
              </Button>
            </Tooltip>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default AddButton
