import { Card, CardBody } from '@heroui/card'
import { Tab, Tabs } from '@heroui/tabs'
import { useMediaQuery } from 'react-responsive'

import ChangePasswordCard from './change_password'
import OneBotConfigCard from './onebot'
import WebUIConfigCard from './webui'

export interface ConfigPageProps {
  children?: React.ReactNode
}

const ConfingPageItem: React.FC<ConfigPageProps> = ({ children }) => {
  return (
    <Card className="bg-opacity-50 backdrop-blur-sm">
      <CardBody className="items-center py-5">
        <div className="w-96 max-w-full flex flex-col gap-2">{children}</div>
      </CardBody>
    </Card>
  )
}

export default function ConfigPage() {
  const isMediumUp = useMediaQuery({ minWidth: 768 })

  return (
    <section className="w-[1000px] max-w-full md:mx-auto gap-4 py-8 px-2 md:py-10">
      <Tabs
        aria-label="config tab"
        fullWidth
        className="w-full"
        isVertical={isMediumUp}
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

        <Tab title="修改密码" key="token">
          <ConfingPageItem>
            <ChangePasswordCard />
          </ConfingPageItem>
        </Tab>
      </Tabs>
    </section>
  )
}
