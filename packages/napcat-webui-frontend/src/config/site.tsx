import {
  LuActivity,
  LuFileText,
  LuFolderOpen,
  LuInfo,
  LuLayoutDashboard,
  LuPlug,
  LuSettings,
  LuSignal,
  LuTerminal,
  LuZap,
} from 'react-icons/lu';

export type SiteConfig = typeof siteConfig;
export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  autoOpen?: boolean;
  href?: string;
  items?: MenuItem[];
  customIcon?: string;
}

export const siteConfig = {
  name: 'NapCat',
  description: 'NapCat WebUI.',
  navItems: [
    {
      label: '基础信息',
      icon: <LuLayoutDashboard className='w-5 h-5' />,
      href: '/',
    },
    {
      label: '网络配置',
      icon: <LuSignal className='w-5 h-5' />,
      href: '/network',
    },
    {
      label: '协议配置',
      icon: <LuPlug className='w-5 h-5' />,
      href: '/protocol',
    },
    {
      label: '其他配置',
      icon: <LuSettings className='w-5 h-5' />,
      href: '/config',
    },
    {
      label: '猫猫日志',
      icon: <LuFileText className='w-5 h-5' />,
      href: '/logs',
    },
    {
      label: '接口调试',
      icon: <LuActivity className='w-5 h-5' />,
      href: '/debug/http',
    },
    {
      label: '实时调试',
      icon: <LuZap className='w-5 h-5' />,
      href: '/debug/ws',
    },
    {
      label: '文件管理',
      icon: <LuFolderOpen className='w-5 h-5' />,
      href: '/file_manager',
    },
    {
      label: '系统终端',
      icon: <LuTerminal className='w-5 h-5' />,
      href: '/terminal',
    },
    {
      label: '关于我们',
      icon: <LuInfo className='w-5 h-5' />,
      href: '/about',
    },
  ] as MenuItem[],
  links: {
    github: 'https://github.com/NapNeko/NapCatQQ',
    docs: 'https://napcat.napneko.icu/',
  },
};
