import { Button } from '@heroui/button';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';
import { Tooltip } from '@heroui/tooltip';
import { FaRegCircleQuestion } from 'react-icons/fa6';
import { IoAddCircleOutline } from 'react-icons/io5';
import { LuGlobe, LuServer, LuWebhook } from 'react-icons/lu';

import { PlusIcon } from '../icons';

export interface SatoriAddButtonProps {
  onOpen: (key: SatoriNetworkConfigKey) => void;
}

const SatoriAddButton: React.FC<SatoriAddButtonProps> = (props) => {
  const { onOpen } = props;

  return (
    <Dropdown
      classNames={{
        content: 'bg-opacity-30 backdrop-blur-md',
      }}
      placement='right'
    >
      <DropdownTrigger>
        <Button
          className="bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md"
          startContent={<IoAddCircleOutline className='text-2xl' />}
        >
          新建
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label='Create Satori Network Config'
        color='default'
        variant='flat'
        onAction={(key) => {
          onOpen(key as SatoriNetworkConfigKey);
        }}
      >
        <DropdownItem
          key='title'
          isReadOnly
          className='cursor-default hover:!bg-transparent'
          textValue='title'
        >
          <div className='flex items-center gap-2 justify-center'>
            <div className='w-5 h-5 -ml-3'>
              <PlusIcon />
            </div>
            <div className='text-primary-400'>新建 Satori 网络配置</div>
          </div>
        </DropdownItem>
        <DropdownItem
          key='websocketServers'
          textValue='websocketServers'
          startContent={<LuServer className='w-5 h-5' />}
        >
          <div className='flex gap-1 items-center'>
            WebSocket 服务器
            <Tooltip
              content='创建一个 Satori WebSocket 服务器，用于推送事件和接收指令。客户端通过 WebSocket 连接到此服务器接收实时事件。'
              showArrow
              className='max-w-64'
            >
              <Button
                isIconOnly
                radius='full'
                size='sm'
                variant='light'
                className='w-4 h-4 min-w-0'
              >
                <FaRegCircleQuestion />
              </Button>
            </Tooltip>
          </div>
        </DropdownItem>
        <DropdownItem
          key='httpServers'
          textValue='httpServers'
          startContent={<LuGlobe className='w-5 h-5' />}
        >
          <div className='flex gap-1 items-center'>
            HTTP 服务器
            <Tooltip
              content='创建一个 Satori HTTP API 服务器，提供 RESTful API 接口。客户端可以通过 HTTP 请求调用各种 API。'
              showArrow
              className='max-w-64'
            >
              <Button
                isIconOnly
                radius='full'
                size='sm'
                variant='light'
                className='w-4 h-4 min-w-0'
              >
                <FaRegCircleQuestion />
              </Button>
            </Tooltip>
          </div>
        </DropdownItem>
        <DropdownItem
          key='webhookClients'
          textValue='webhookClients'
          startContent={<LuWebhook className='w-5 h-5' />}
        >
          <div className='flex gap-1 items-center'>
            WebHook 客户端
            <Tooltip
              content='配置一个 WebHook 上报地址，NapCat 会将事件通过 HTTP POST 请求发送到指定的 URL。'
              showArrow
              className='max-w-64'
            >
              <Button
                isIconOnly
                radius='full'
                size='sm'
                variant='light'
                className='w-4 h-4 min-w-0'
              >
                <FaRegCircleQuestion />
              </Button>
            </Tooltip>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default SatoriAddButton;
