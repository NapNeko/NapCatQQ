import { Card, CardBody } from '@heroui/card';
import { Tab, Tabs } from '@heroui/tabs';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { useNavigate, useSearchParams } from 'react-router-dom';

import key from '@/const/key';

import ChangePasswordCard from './change_password';
import LoginConfigCard from './login';
import OneBotConfigCard from './onebot';
import ServerConfigCard from './server';
import ThemeConfigCard from './theme';
import WebUIConfigCard from './webui';

export interface ConfigPageProps {
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const ConfigPageItem: React.FC<ConfigPageProps> = ({
  children,
  size = 'md',
}) => {
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  return (
    <Card className={clsx(
      'w-full mx-auto backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-sm rounded-2xl transition-all',
      hasBackground ? 'bg-white/20 dark:bg-black/10' : 'bg-white/60 dark:bg-black/40',
      {
        'max-w-xl': size === 'sm',
        'max-w-3xl': size === 'md',
        'max-w-6xl': size === 'lg',
      }
    )}>
      <CardBody className='py-6 px-4 md:py-8 md:px-12'>
        <div className='w-full flex flex-col gap-5'>
          {children}
        </div>
      </CardBody>
    </Card>
  );
};

export default function ConfigPage () {
  const navigate = useNavigate();
  const search = useSearchParams({
    tab: 'onebot',
  })[0];
  const tab = search.get('tab') ?? 'onebot';

  return (
    <section className='w-full max-w-[1200px] mx-auto py-4 md:py-8 px-2 md:px-6 relative'>
      <title>其它配置 - NapCat WebUI</title>
      <Tabs
        aria-label='config tab'
        fullWidth={false}
        className='w-full'
        selectedKey={tab}
        onSelectionChange={(key) => {
          navigate(`/config?tab=${key}`);
        }}
        classNames={{
          base: 'w-full flex-col items-center',
          tabList: 'bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-white/20 dark:border-white/5 mb-4 md:mb-8 w-full md:w-fit mx-auto overflow-x-auto hide-scrollbar',
          cursor: 'bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-sm rounded-xl',
          tab: 'h-9 px-4 md:px-6',
          tabContent: 'text-default-600 dark:text-default-300 font-medium group-data-[selected=true]:text-primary',
          panel: 'w-full relative p-0',
        }}
      >
        <Tab title='OneBot配置' key='onebot'>
          <ConfigPageItem>
            <OneBotConfigCard />
          </ConfigPageItem>
        </Tab>
        <Tab title='服务器配置' key='server'>
          <ConfigPageItem>
            <ServerConfigCard />
          </ConfigPageItem>
        </Tab>
        <Tab title='WebUI配置' key='webui'>
          <ConfigPageItem>
            <WebUIConfigCard />
          </ConfigPageItem>
        </Tab>
        <Tab title='登录配置' key='login'>
          <ConfigPageItem>
            <LoginConfigCard />
          </ConfigPageItem>
        </Tab>
        <Tab title='修改密码' key='token'>
          <ConfigPageItem size='sm'>
            <ChangePasswordCard />
          </ConfigPageItem>
        </Tab>

        <Tab title='主题配置' key='theme'>
          <ConfigPageItem size='lg'>
            <ThemeConfigCard />
          </ConfigPageItem>
        </Tab>
      </Tabs>
    </section>
  );
}
