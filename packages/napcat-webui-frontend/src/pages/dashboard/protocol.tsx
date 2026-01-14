import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { useDisclosure } from '@heroui/modal';
import { Tab, Tabs } from '@heroui/tabs';
import { Switch } from '@heroui/switch';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh } from 'react-icons/io';
import { LuPlug } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import SatoriAddButton from '@/components/button/satori_add_button';
import PageLoading from '@/components/page_loading';
import SatoriNetworkFormModal from '@/components/protocol_edit/satori_modal';
import SatoriDisplayCard, { SatoriDisplayCardField } from '@/components/protocol_edit/satori_common_card';

import useProtocolConfig from '@/hooks/use-protocol-config';
import useDialog from '@/hooks/use-dialog';

export interface EmptySectionProps {
  isEmpty: boolean;
}

const EmptySection: React.FC<EmptySectionProps> = ({ isEmpty }) => {
  return (
    <div
      className={clsx('text-default-400', {
        hidden: !isEmpty,
      })}
    >
      暂时还没有配置项哈
    </div>
  );
};

export default function ProtocolPage () {
  const {
    protocols,
    protocolStatus,
    satoriConfig,
    refreshProtocols,
    refreshSatoriConfig,
    createSatoriNetworkConfig,
    updateSatoriNetworkConfig,
    deleteSatoriNetworkConfig,
    enableSatoriNetworkConfig,
    enableSatoriDebugConfig,
    toggleProtocol,
  } = useProtocolConfig();

  const [loading, setLoading] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<string>('satori');
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
    if (!protocolStatus['satori']) {
      dialog.confirm({
        title: '启用 Satori 协议',
        content: '检测到 Satori 协议未启用，是否立即启用并继续创建配置？',
        onConfirm: async () => {
          const loadingToast = toast.loading('正在启用协议...');
          try {
            await toggleProtocol('satori', true);
            await refreshSatoriConfig();
            toast.success('协议已启用');

            setActiveSatoriField(key);
            setActiveSatoriName('');
            onOpen();
          } catch (error) {
            toast.error(`启用失败: ${(error as Error).message}`);
          } finally {
            toast.dismiss(loadingToast);
          }
        },
      });
      return;
    }
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
      throw error;
    }
  };

  const onEnableDebug = async (field: SatoriNetworkConfigKey, name: string) => {
    try {
      await enableSatoriDebugConfig(field, name);
      toast.success('更新配置成功');
    } catch (error) {
      toast.error(`更新配置失败: ${(error as Error).message}`);
      throw error;
    }
  };

  const onEdit = (field: SatoriNetworkConfigKey, name: string) => {
    setActiveSatoriField(field);
    setActiveSatoriName(name);
    onOpen();
  };

  const activeSatoriData = useMemo(() => {
    return satoriConfig?.network[activeSatoriField]?.find(
      (item: SatoriAdapterConfig) => item.name === activeSatoriName
    );
  }, [satoriConfig, activeSatoriField, activeSatoriName]);

  useEffect(() => {
    refresh();
  }, []);

  const renderSatoriCard = (
    type: SatoriNetworkConfigKey,
    item: SatoriAdapterConfig,
    typeLabel: string
  ) => {
    let fields: SatoriDisplayCardField[] = [];

    if (type === 'websocketServers') {
      const data = item as SatoriWebSocketServerConfig;
      fields = [
        { label: '主机', value: data.host },
        { label: '端口', value: data.port },
        { label: '路径', value: data.path },
        { label: '心跳间隔', value: `${data.heartInterval}ms` },
        { label: 'Token', value: data.token ? '******' : '未设置' },
      ];
    } else if (type === 'httpServers') {
      const data = item as SatoriHttpServerConfig;
      fields = [
        { label: '主机', value: data.host },
        { label: '端口', value: data.port },
        { label: '路径', value: data.path },
        { label: 'Token', value: data.token ? '******' : '未设置' },
      ];
    } else if (type === 'webhookClients') {
      const data = item as SatoriWebHookClientConfig;
      fields = [
        { label: 'WebHook URL', value: data.url },
        { label: 'Token', value: data.token ? '******' : '未设置' },
      ];
    }

    return (
      <SatoriDisplayCard
        key={item.name}
        typeLabel={typeLabel}
        data={item as any}
        fields={fields}
        onDelete={() => onDelete(type, item.name)}
        onEdit={() => onEdit(type, item.name)}
        onEnable={() => onEnable(type, item.name)}
        onEnableDebug={() => onEnableDebug(type, item.name)}
      />
    );
  };

  const satoriTabs = useMemo(() => {
    if (!satoriConfig) return [];

    const wsItems = satoriConfig.network.websocketServers.map((item) =>
      renderSatoriCard('websocketServers', item, 'WS服务器')
    );
    const httpItems = satoriConfig.network.httpServers.map((item) =>
      renderSatoriCard('httpServers', item, 'HTTP服务器')
    );
    const webhookItems = satoriConfig.network.webhookClients.map((item) =>
      renderSatoriCard('webhookClients', item, 'WebHook客户端')
    );

    const allItems = [...wsItems, ...httpItems, ...webhookItems];

    return [
      {
        key: 'all',
        title: '全部',
        items: allItems,
      },
      {
        key: 'websocketServers',
        title: 'WebSocket 服务器',
        items: wsItems,
      },
      {
        key: 'httpServers',
        title: 'HTTP 服务器',
        items: httpItems,
      },
      {
        key: 'webhookClients',
        title: 'WebHook 客户端',
        items: webhookItems,
      },
    ];
  }, [satoriConfig]);

  return (
    <>
      <title>协议配置 - NapCat WebUI</title>
      <div className="p-4 md:p-6 relative max-w-[1920px] mx-auto min-h-screen">
        <PageLoading loading={loading} />
        <SatoriNetworkFormModal
          data={activeSatoriData}
          field={activeSatoriField}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onCreate={createSatoriNetworkConfig}
          onUpdate={updateSatoriNetworkConfig}
        />

        <div className="flex flex-col gap-6">
          {/* Protocol Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {protocols.map((protocol: ProtocolInfo) => {
              const isActive = activeProtocol === protocol.id;
              const isEnabled = protocolStatus[protocol.id];

              return (
                <Card
                  key={protocol.id}
                  isPressable
                  onPress={() => setActiveProtocol(protocol.id)}
                  className={clsx(
                    "border transition-all duration-300",
                    isActive
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-transparent bg-default-100/50 hover:bg-default-200/50"
                  )}
                  shadow={isActive ? "sm" : "none"}
                >
                  <CardBody className="flex flex-row items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "p-2 rounded-lg transition-colors",
                        isActive ? "bg-primary text-white" : "bg-default-200 text-default-500"
                      )}>
                        <LuPlug size={20} />
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className={clsx(
                          "font-bold text-base",
                          isActive ? "text-primary" : "text-default-700"
                        )}>
                          {protocol.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={clsx(
                            "w-2 h-2 rounded-full",
                            isEnabled ? "bg-success animate-pulse" : "bg-default-300"
                          )} />
                          <span className="text-xs text-default-400">
                            {isEnabled ? "运行中" : "已停止"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        size="sm"
                        color={isEnabled ? "success" : "default"}
                        isSelected={isEnabled}
                        onValueChange={(val) => toggleProtocol(protocol.id, val)}
                      />
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeProtocol === 'onebot11' && (
              <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-default-200 dark:border-default-100 rounded-3xl bg-default-50/30 min-h-[400px]">
                <div className="p-4 rounded-full bg-default-100 mb-6">
                  <LuPlug className="w-12 h-12 text-default-400" />
                </div>
                <h3 className="text-xl font-bold text-default-700 mb-2">OneBot 11 协议配置</h3>
                <p className="text-default-500 mb-8 max-w-md leading-relaxed">
                  OneBot 11 协议的网络配置已集成在系统的基础网络设置中，请前往网络配置页面进行管理。
                </p>
                <div className="flex gap-4">
                  <Button
                    as={Link}
                    to="/dashboard/network"
                    color="primary"
                    variant="shadow"
                    className="font-medium px-8"
                    radius="full"
                  >
                    前往网络配置
                  </Button>
                  <Button
                    variant="flat"
                    className="font-medium px-8"
                    radius="full"
                    startContent={<IoMdRefresh size={18} />}
                    onPress={refresh}
                  >
                    刷新状态
                  </Button>
                </div>
              </div>
            )}

            {activeProtocol === 'satori' && satoriConfig && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Satori Content Header - Optional, maybe just space */}
                  <div className="hidden md:block"></div>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <SatoriAddButton onOpen={handleClickCreate} />
                    <Button
                      isIconOnly
                      className="bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md shadow-sm"
                      onPress={refresh}
                    >
                      <IoMdRefresh size={20} />
                    </Button>
                  </div>
                </div>

                <Tabs
                  aria-label="Satori Network Configs"
                  className="w-full"
                  items={satoriTabs}
                  classNames={{
                    tabList: 'bg-default-100/50 dark:bg-default-50/20 backdrop-blur-md p-1 rounded-2xl mb-6 w-full md:w-auto',
                    cursor: 'bg-background shadow-sm rounded-xl',
                    tab: 'h-9 px-4',
                    tabContent: 'text-default-500 group-data-[selected=true]:text-primary font-medium',
                    panel: 'pt-0'
                  }}
                >
                  {(item) => (
                    <Tab key={item.key} title={item.title}>
                      <EmptySection isEmpty={!item.items?.length} />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 pb-8">
                        {item.items}
                      </div>
                    </Tab>
                  )}
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
