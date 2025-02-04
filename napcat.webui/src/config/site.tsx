import {
  BugIcon2,
  FileIcon,
  InfoIcon,
  LogIcon,
  RouteIcon,
  SettingsIcon,
  SignalTowerIcon,
  TerminalIcon
} from '@/components/icons'

export type SiteConfig = typeof siteConfig
export interface MenuItem {
  label: string
  icon?: React.ReactNode
  autoOpen?: boolean
  href?: string
  items?: MenuItem[]
  customIcon?: string
}

export const siteConfig = {
  name: 'NapCat WebUI',
  description: 'NapCat WebUI.',
  navItems: [
    {
      label: '基础信息',
      icon: (
        <div className="w-5 h-5">
          <RouteIcon />
        </div>
      ),
      href: '/'
    },
    {
      label: '网络配置',
      icon: (
        <div className="w-5 h-5">
          <SignalTowerIcon />
        </div>
      ),
      href: '/network'
    },
    {
      label: '其他配置',
      icon: (
        <div className="w-5 h-5">
          <SettingsIcon />
        </div>
      ),
      href: '/config'
    },
    {
      label: '猫猫日志',
      icon: (
        <div className="w-5 h-5">
          <LogIcon />
        </div>
      ),
      href: '/logs'
    },
    {
      label: '接口调试',
      icon: (
        <div className="w-5 h-5">
          <BugIcon2 />
        </div>
      ),
      items: [
        {
          label: 'HTTP',
          href: '/debug/http'
        },
        {
          label: 'Websocket',
          href: '/debug/ws'
        }
      ]
    },
    {
      label: '文件管理',
      icon: (
        <div className="w-5 h-5">
          <FileIcon />
        </div>
      ),
      href: '/file_manager'
    },
    {
      label: '系统终端',
      icon: (
        <div className="w-5 h-5">
          <TerminalIcon />
        </div>
      ),
      href: '/terminal'
    },
    {
      label: '关于我们',
      icon: (
        <div className="w-5 h-5">
          <InfoIcon />
        </div>
      ),
      href: '/about'
    }
  ] as MenuItem[],
  links: {
    github: 'https://github.com/NapNeko/NapCatQQ',
    docs: 'https://napcat.napneko.icu/'
  }
}
