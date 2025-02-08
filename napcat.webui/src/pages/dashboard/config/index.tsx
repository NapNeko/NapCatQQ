import { Card, CardBody } from '@heroui/card'
import { Tab, Tabs } from '@heroui/tabs'
import clsx from 'clsx'
import { useMediaQuery } from 'react-responsive'
import { useNavigate, useSearchParams } from 'react-router-dom'

import ChangePasswordCard from './change_password'
import LoginConfigCard from './login'
import OneBotConfigCard from './onebot'
import ThemeConfigCard from './theme'
import WebUIConfigCard from './webui'

export interface ConfigPageProps {
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const ConfingPageItem: React.FC<ConfigPageProps> = ({
  children,
  size = 'md'
}) => {
  return (
    <Card className="bg-opacity-50 backdrop-blur-sm">
      <CardBody className="items-center py-5">
        <div
          className={clsx('max-w-full flex flex-col gap-2', {
            'w-72': size === 'sm',
            'w-96': size === 'md',
            'w-[32rem]': size === 'lg'
          })}
        >
          {children}
        </div>
      </CardBody>
    </Card>
  )
}

export default function ConfigPage() {
  const isMediumUp = useMediaQuery({ minWidth: 768 })
  const navigate = useNavigate()
  const search = useSearchParams({
    tab: 'onebot'
  })[0]
  const tab = search.get('tab') ?? 'onebot'

  return (
    <section className="w-[1000px] max-w-full md:mx-auto gap-4 py-8 px-2 md:py-10">
      <Tabs
        aria-label="config tab"
        fullWidth
        className="w-full"
        isVertical={isMediumUp}
        selectedKey={tab}
        onSelectionChange={(key) => {
          navigate(`/config?tab=${key}`)
        }}
        classNames={{
          tabList: 'sticky flex top-14 bg-opacity-50 backdrop-blur-sm',
          panel: 'w-full relative',
          base: 'md:!w-auto flex-grow-0 flex-shrink-0 mr-0',
          cursor: 'bg-opacity-60 backdrop-blur-sm'
        }}
      >
        <Tab title="OneBot配置" key="onebot">
          <ConfingPageItem>
            <OneBotConfigCard />
          </ConfingPageItem>
        </Tab>
        <Tab title="WebUI配置" key="webui">
          <ConfingPageItem>
            <WebUIConfigCard />
          </ConfingPageItem>
        </Tab>
        <Tab title="登录配置" key="login">
          <ConfingPageItem>
            <LoginConfigCard />
          </ConfingPageItem>
        </Tab>
        <Tab title="修改密码" key="token">
          <ConfingPageItem>
            <ChangePasswordCard />
          </ConfingPageItem>
        </Tab>

        <Tab title="主题配置" key="theme">
          <ConfingPageItem size="lg">
            <ThemeConfigCard />
          </ConfingPageItem>
        </Tab>
      </Tabs>
    </section>
  )
}
