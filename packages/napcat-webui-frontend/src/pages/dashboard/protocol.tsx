import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { useDisclosure } from '@heroui/modal';
import { Tab, Tabs } from '@heroui/tabs';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh } from 'react-icons/io';
import { LuPlug, LuSettings } from 'react-icons/lu';

import SatoriAddButton from '@/components/button/satori_add_button';
import PageLoading from '@/components/page_loading';
import SatoriNetworkFormModal from '@/components/protocol_edit/satori_modal';
import SatoriWSServerCard from '@/components/protocol_edit/satori_ws_server_card';
import SatoriHttpServerCard from '@/components/protocol_edit/satori_http_server_card';
import SatoriWebhookClientCard from '@/components/protocol_edit/satori_webhook_client_card';

import useProtocolConfig from '@/hooks/use-protocol-config';
import useDialog from '@/hooks/use-dialog';

export default function ProtocolPage () {
  const {
    protocols,
    protocolStatus,
    satoriConfig,
    refreshProtocols,
    refreshSatoriConfig,
    deleteSatoriNetworkConfig,
    enableSatoriNetworkConfig,
    enableSatoriDebugConfig,
  } = useProtocolConfig();

  const [loading, setLoading] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<string>('onebot11');
  const [activeSatoriField, setActiveSatoriField] = useState<SatoriNetworkConfigKey>('websocketServers');
  const [activeSatoriName, setActiveSatoriName] = useState<string>('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const dialog = useDialog();

  const refresh = async () => {
    setLoading(true);
    try {
      await refreshProtocols();
      await refreshSatoriConfig();
    } catch (error) {
      toast.error(`刷新失败: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClickCreate = (key: SatoriNetworkConfigKey) => {
    setActiveSatoriField(key);
    setActiveSatoriName('');
    onOpen();
  };

  const onDelete = async (field: SatoriNetworkConfigKey, name: string) => {
    return new Promise<void>((resolve, reject) => {
      dialog.confirm({
        title: '删除配置',
        content: `确定要删除配置「${name}」吗?`,
        onConfirm: async () => {
          try {
            await deleteSatoriNetworkConfig(field, name);
            toast.success('删除配置成功');
            resolve();
          } catch (error) {
            toast.error(`删除配置失败: ${(error as Error).message}`);
            reject(error);
          }
        },
        onCancel: () => resolve(),
      });
    });
  };

  const onEnable = async (field: SatoriNetworkConfigKey, name: string) => {
    try {
      await enableSatoriNetworkConfig(field, name);
      toast.success('更新配置成功');
    } catch (error) {
      toast.error(`更新配置失败: ${(error as Error).message}`);
    }
  };

  const onEnableDebug = async (field: SatoriNetworkConfigKey, name: string) => {
    try {
      await enableSatoriDebugConfig(field, name);
      toast.success('更新配置成功');
    } catch (error) {
      toast.error(`更新配置失败: ${(error as Error).message}`);
    }
  };

  const onEdit = (field: SatoriNetworkConfigKey, name: string) => {
    setActiveSatoriField(field);
    setActiveSatoriName(name);
    onOpen();
  };

  const activeSatoriData = satoriConfig?.network[activeSatoriField]?.find(
    (item: SatoriAdapterConfig) => item.name === activeSatoriName
  );

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <title>协议配置 - NapCat WebUI</title>
      <div className="p-2 md:p-4 relative">
        <PageLoading loading={loading} />
        <SatoriNetworkFormModal
          data={activeSatoriData}
          field={activeSatoriField}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />

        <div className="flex mb-6 items-center gap-4">
          <Button
            isIconOnly
            className="bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md"
            radius="full"
            onPress={refresh}
          >
            <IoMdRefresh size={24} />
          </Button>
        </div>

        {/* 协议列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {protocols.map((protocol: ProtocolInfo) => (
            <Card
              key={protocol.id}
              className={clsx(
                'cursor-pointer transition-all',
                activeProtocol === protocol.id
                  ? 'ring-2 ring-primary'
                  : 'hover:shadow-lg'
              )}
              isPressable
              onPress={() => setActiveProtocol(protocol.id)}
            >
              <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <LuPlug className="w-5 h-5" />
                  <span className="font-semibold">{protocol.name}</span>
                </div>
                <Chip
                  color={protocolStatus[protocol.id] ? 'success' : 'default'}
                  size="sm"
                  variant="flat"
                >
                  {protocolStatus[protocol.id] ? '已启用' : '未启用'}
                </Chip>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-default-500">{protocol.description}</p>
                <p className="text-xs text-default-400 mt-2">版本: {protocol.version}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* 协议配置详情 */}
        {activeProtocol === 'onebot11' && (
          <Card>
            <CardHeader className="flex items-center gap-2">
              <LuSettings className="w-5 h-5" />
              <span className="font-semibold">OneBot 11 配置</span>
            </CardHeader>
            <CardBody>
              <p className="text-default-500">
                OneBot 11 协议配置请前往
                <a href="/network" className="text-primary ml-1">
                  网络配置
                </a>
                页面进行管理。
              </p>
            </CardBody>
          </Card>
        )}

        {activeProtocol === 'satori' && satoriConfig && (
          <Card>
            <CardHeader className="flex items-center gap-2">
              <LuSettings className="w-5 h-5" />
              <span className="font-semibold">Satori 协议配置</span>
            </CardHeader>
            <CardBody>
              <div className="flex mb-4 items-center gap-4">
                <SatoriAddButton onOpen={handleClickCreate} />
              </div>

              <Tabs
                aria-label="Satori Network Configs"
                className="max-w-full"
                classNames={{
                  tabList: 'bg-white/40 dark:bg-black/20 backdrop-blur-md',
                  cursor: 'bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-sm',
                }}
              >
                <Tab key="websocketServers" title="WebSocket 服务器">
                  {satoriConfig.network.websocketServers.length === 0 ? (
                    <p className="text-default-400">暂无配置</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {satoriConfig.network.websocketServers.map((item: SatoriWebSocketServerConfig) => (
                        <SatoriWSServerCard
                          key={item.name}
                          data={item}
                          onDelete={() => onDelete('websocketServers', item.name)}
                          onEdit={() => onEdit('websocketServers', item.name)}
                          onEnable={() => onEnable('websocketServers', item.name)}
                          onEnableDebug={() => onEnableDebug('websocketServers', item.name)}
                        />
                      ))}
                    </div>
                  )}
                </Tab>
                <Tab key="httpServers" title="HTTP 服务器">
                  {satoriConfig.network.httpServers.length === 0 ? (
                    <p className="text-default-400">暂无配置</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {satoriConfig.network.httpServers.map((item: SatoriHttpServerConfig) => (
                        <SatoriHttpServerCard
                          key={item.name}
                          data={item}
                          onDelete={() => onDelete('httpServers', item.name)}
                          onEdit={() => onEdit('httpServers', item.name)}
                          onEnable={() => onEnable('httpServers', item.name)}
                          onEnableDebug={() => onEnableDebug('httpServers', item.name)}
                        />
                      ))}
                    </div>
                  )}
                </Tab>
                <Tab key="webhookClients" title="WebHook 客户端">
                  {satoriConfig.network.webhookClients.length === 0 ? (
                    <p className="text-default-400">暂无配置</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {satoriConfig.network.webhookClients.map((item: SatoriWebHookClientConfig) => (
                        <SatoriWebhookClientCard
                          key={item.name}
                          data={item}
                          onDelete={() => onDelete('webhookClients', item.name)}
                          onEdit={() => onEdit('webhookClients', item.name)}
                          onEnable={() => onEnable('webhookClients', item.name)}
                          onEnableDebug={() => onEnableDebug('webhookClients', item.name)}
                        />
                      ))}
                    </div>
                  )}
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
}
