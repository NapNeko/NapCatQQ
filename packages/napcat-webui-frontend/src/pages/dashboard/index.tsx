import { Card, CardBody } from '@heroui/card';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useRequest } from 'ahooks';
import clsx from 'clsx';
import { useCallback, useEffect, useState, useRef } from 'react';
import key from '@/const/key';

import toast from 'react-hot-toast';

import NetworkItemDisplay from '@/components/display_network_item';
import Hitokoto from '@/components/hitokoto';
import QQInfoCard from '@/components/qq_info_card';
import SystemInfo from '@/components/system_info';
import SystemStatusDisplay from '@/components/system_status_display';

import useConfig from '@/hooks/use-config';

import QQManager from '@/controllers/qq_manager';
import WebUIManager from '@/controllers/webui_manager';

const Networks: React.FC = () => {
  const { config, refreshConfig } = useConfig();
  const allNetWorkConfigLength =
    config.network.httpClients.length +
    config.network.websocketClients.length +
    config.network.websocketServers.length +
    config.network.httpServers.length;

  useEffect(() => {
    refreshConfig();
  }, []);
  return (
    <div className='grid grid-cols-8 md:grid-cols-3 lg:grid-cols-6 gap-y-2 gap-x-1 md:gap-y-4 md:gap-x-4 py-5'>
      <NetworkItemDisplay count={allNetWorkConfigLength} label='网络配置' />
      <NetworkItemDisplay
        count={config.network.httpServers.length}
        label='HTTP服务器'
        size='sm'
      />
      <NetworkItemDisplay
        count={config.network.httpClients.length}
        label='HTTP客户端'
        size='sm'
      />
      <NetworkItemDisplay
        count={config.network.websocketServers.length}
        label='WS服务器'
        size='sm'
      />
      <NetworkItemDisplay
        count={config.network.websocketClients.length}
        label='WS客户端'
        size='sm'
      />
    </div>
  );
};

const QQInfo: React.FC = () => {
  const { data, loading, error } = useRequest(QQManager.getQQLoginInfo);
  return <QQInfoCard data={data} error={error} loading={loading} />;
};

export interface SystemStatusCardProps {
  setArchInfo: (arch: string | undefined) => void;
}
const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ setArchInfo }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>();
  const isSetted = useRef(false);
  const getStatus = useCallback(() => {
    try {
      const event = WebUIManager.getSystemStatus(setSystemStatus);
      return event;
    } catch (_error) {
      toast.error('获取系统状态失败');
    }
  }, []);

  useEffect(() => {
    const close = getStatus();
    return () => {
      close?.close();
    };
  }, [getStatus]);

  useEffect(() => {
    if (systemStatus?.arch && !isSetted.current) {
      setArchInfo(systemStatus.arch);
      isSetted.current = true;
    }
  }, [systemStatus, setArchInfo]);

  return <SystemStatusDisplay data={systemStatus} />;
};

const DashboardIndexPage: React.FC = () => {
  const [archInfo, setArchInfo] = useState<string>();
  // @ts-ignore
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  return (
    <>
      <title>基础信息 - NapCat WebUI</title>
      <section className='w-full p-2 md:p-4 md:max-w-[1000px] mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch'>
          <div className='flex flex-col gap-2'>
            <QQInfo />
            <SystemInfo archInfo={archInfo} />
          </div>
          <SystemStatusCard setArchInfo={setArchInfo} />
        </div>
        <Networks />
        <Card className={clsx(
          'backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-sm transition-all',
          hasBackground ? 'bg-white/10 dark:bg-black/10' : 'bg-white/60 dark:bg-black/40'
        )}>
          <CardBody>
            <Hitokoto />
          </CardBody>
        </Card>
      </section>
    </>
  );
};

export default DashboardIndexPage;
