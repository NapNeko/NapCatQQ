import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Button } from '@nextui-org/button'
import { IoMdRefresh } from 'react-icons/io'
import { useDisclosure } from '@nextui-org/modal'

import AddButton from '@/components/add_button'
import {
  HTTPClientIcon,
  HTTPServerIcon,
  PCIcon,
  WebsocketIcon
} from '@/components/icons'
import { title } from '@/components/primitives'
import useConfig from '@/hooks/use-config'
import PageLoading from '@/components/page_loading'
import NetworkFormModal from '@/components/network_edit/modal'
import HTTPServerDisplayCard from '@/components/display_card/http_server'
import useDialog from '@/hooks/use-dialog'
import HTTPClientDisplayCard from '@/components/display_card/http_client'
import WebsocketServerDisplayCard from '@/components/display_card/ws_server'
import WebsocketClientDisplayCard from '@/components/display_card/ws_client'
export interface SectionProps {
  title: string
  color?:
    | 'violet'
    | 'yellow'
    | 'blue'
    | 'cyan'
    | 'green'
    | 'pink'
    | 'foreground'
  icon: React.ReactNode
  children: React.ReactNode
}

function Section({
  title: _title,
  children,
  icon,
  color = 'pink'
}: SectionProps) {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8">{icon}</div>

        <h2
          className={title({
            color: color,
            size: 'xs',
            shadow: true
          })}
        >
          {_title}
        </h2>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-start items-stretch gap-x-2 gap-y-4 p-1 md:p-2">
        {children}
      </section>
    </section>
  )
}

export interface EmptySectionProps {
  isEmpty: boolean
}

const EmptySection: React.FC<EmptySectionProps> = ({ isEmpty }) => {
  return (
    <div
      className={clsx('text-default-400', {
        hidden: !isEmpty
      })}
    >
      暂时还没有配置项哈
    </div>
  )
}

export default function NetworkPage() {
  const {
    config,
    refreshConfig,
    deleteNetworkConfig,
    enableNetworkConfig,
    enableDebugNetworkConfig
  } = useConfig()
  const [activeField, setActiveField] =
    useState<keyof OneBotConfig['network']>('httpServers')
  const [activeName, setActiveName] = useState<string>('')
  const {
    network: { httpServers, httpClients, websocketServers, websocketClients }
  } = config
  const [loading, setLoading] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const dialog = useDialog()
  const activeData = useMemo(() => {
    const findData = config.network[activeField].find(
      (item) => item.name === activeName
    )

    return findData
  }, [activeField, activeName, config])

  const refresh = async () => {
    setLoading(true)
    try {
      await refreshConfig()
      setLoading(false)
    } catch (error) {
      const msg = (error as Error).message

      toast.error(`获取配置失败: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClickCreate = (key: keyof OneBotConfig['network']) => {
    setActiveField(key)
    setActiveName('')
    onOpen()
  }

  const onDelete = async (
    field: keyof OneBotConfig['network'],
    name: string
  ) => {
    return new Promise<void>((resolve, reject) => {
      dialog.confirm({
        title: '删除配置',
        content: `确定要删除配置「${name}」吗?`,
        onConfirm: async () => {
          try {
            await deleteNetworkConfig(field, name)
            toast.success('删除配置成功')
            resolve()
          } catch (error) {
            const msg = (error as Error).message

            toast.error(`删除配置失败: ${msg}`)

            reject(error)
          }
        },
        onCancel: () => {
          resolve()
        }
      })
    })
  }

  const onEnable = async (
    field: keyof OneBotConfig['network'],
    name: string
  ) => {
    try {
      await enableNetworkConfig(field, name)
      toast.success('更新配置成功')
    } catch (error) {
      const msg = (error as Error).message

      toast.error(`更新配置失败: ${msg}`)

      throw error
    }
  }

  const onEnableDebug = async (
    field: keyof OneBotConfig['network'],
    name: string
  ) => {
    try {
      await enableDebugNetworkConfig(field, name)
      toast.success('更新配置成功')
    } catch (error) {
      const msg = (error as Error).message

      toast.error(`更新配置失败: ${msg}`)

      throw error
    }
  }

  const onEdit = (field: keyof OneBotConfig['network'], name: string) => {
    setActiveField(field)
    setActiveName(name)
    onOpen()
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div className="p-2 md:p-4 relative min-h-full">
      <NetworkFormModal
        data={activeData}
        field={activeField}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
      <PageLoading loading={loading} />
      <div className="flex mb-6 items-center gap-4">
        <AddButton onOpen={handleClickCreate} />
        <Button
          isIconOnly
          color="primary"
          radius="full"
          size="lg"
          variant="flat"
          onClick={refresh}
        >
          <IoMdRefresh size={24} />
        </Button>
      </div>
      <Section color="green" icon={<HTTPServerIcon />} title="HTTP服务器">
        <EmptySection isEmpty={!httpServers.length} />
        {httpServers.map((item) => (
          <HTTPServerDisplayCard
            key={item.name}
            data={item}
            onDelete={async () => {
              await onDelete('httpServers', item.name)
            }}
            onEdit={() => {
              onEdit('httpServers', item.name)
            }}
            onEnable={async () => {
              await onEnable('httpServers', item.name)
            }}
            onEnableDebug={async () => {
              await onEnableDebug('httpServers', item.name)
            }}
          />
        ))}
      </Section>
      <Section color="cyan" icon={<HTTPClientIcon />} title="HTTP客户端">
        <EmptySection isEmpty={!httpClients.length} />
        {httpClients.map((item) => (
          <HTTPClientDisplayCard
            key={item.name}
            data={item}
            onDelete={async () => {
              await onDelete('httpClients', item.name)
            }}
            onEdit={() => {
              onEdit('httpClients', item.name)
            }}
            onEnable={async () => {
              await onEnable('httpClients', item.name)
            }}
            onEnableDebug={async () => {
              await onEnableDebug('httpClients', item.name)
            }}
          />
        ))}
      </Section>
      <Section color="pink" icon={<WebsocketIcon />} title="Websocket服务器">
        <EmptySection isEmpty={!websocketServers.length} />
        {websocketServers.map((item) => (
          <WebsocketServerDisplayCard
            key={item.name}
            data={item}
            onDelete={async () => {
              await onDelete('websocketServers', item.name)
            }}
            onEdit={() => {
              onEdit('websocketServers', item.name)
            }}
            onEnable={async () => {
              await onEnable('websocketServers', item.name)
            }}
            onEnableDebug={async () => {
              await onEnableDebug('websocketServers', item.name)
            }}
          />
        ))}
      </Section>
      <Section color="yellow" icon={<PCIcon />} title="Websocket客户端">
        <EmptySection isEmpty={!websocketClients.length} />
        {websocketClients.map((item) => (
          <WebsocketClientDisplayCard
            key={item.name}
            data={item}
            onDelete={async () => {
              await onDelete('websocketClients', item.name)
            }}
            onEdit={() => {
              onEdit('websocketClients', item.name)
            }}
            onEnable={async () => {
              await onEnable('websocketClients', item.name)
            }}
            onEnableDebug={async () => {
              await onEnableDebug('websocketClients', item.name)
            }}
          />
        ))}
      </Section>
    </div>
  )
}
