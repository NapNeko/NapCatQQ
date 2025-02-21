import { Card, CardBody } from '@heroui/card'
import { Image } from '@heroui/image'
import clsx from 'clsx'
import { BiSolidMemoryCard } from 'react-icons/bi'
import { GiCpu } from 'react-icons/gi'

import bkg from '@/assets/images/bg/1AD934174C0107F14BAD8776D29C5F90.png'

import UsagePie from './usage_pie'

export interface SystemStatusItemProps {
  title: string
  value?: string | number
  size?: 'md' | 'lg'
  unit?: string
}

const SystemStatusItem: React.FC<SystemStatusItemProps> = ({
  title,
  value = '-',
  size = 'md',
  unit
}) => {
  return (
    <div
      className={clsx(
        'shadow-sm shadow-primary-100 p-2 rounded-md text-sm bg-content1 bg-opacity-30',
        size === 'lg' ? 'col-span-2' : 'col-span-1 flex justify-between'
      )}
    >
      <div className="w-24">{title}</div>
      <div className="text-default-400">
        {value}
        {unit}
      </div>
    </div>
  )
}

export interface SystemStatusDisplayProps {
  data?: SystemStatus
}

const SystemStatusDisplay: React.FC<SystemStatusDisplayProps> = ({ data }) => {
  const memoryUsage = {
    system: 0,
    qq: 0
  }
  if (data) {
    const system = Number(data.memory.total) || 1
    const systemUsage = Number(data.memory.usage.system)
    const qqUsage = Number(data.memory.usage.qq)
    memoryUsage.system = (systemUsage / system) * 100
    memoryUsage.qq = (qqUsage / system) * 100
  }

  return (
    <Card className="bg-opacity-60 shadow-sm shadow-primary-100 col-span-1 lg:col-span-2 relative overflow-hidden">
      <div className="absolute h-full right-0 top-0">
        <Image
          src={bkg}
          alt="background"
          className="select-none pointer-events-none !opacity-30 w-full h-full"
          classNames={{
            wrapper: 'w-full h-full',
            img: 'object-contain w-full h-full'
          }}
        />
      </div>
      <CardBody className="overflow-visible md:flex-row gap-4 items-center justify-stretch z-10">
        <div className="flex-1 w-full md:max-w-96">
          <h2 className="text-lg font-semibold flex items-center gap-1 text-primary-400">
            <GiCpu className="text-xl" />
            <span>CPU</span>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <SystemStatusItem title="型号" value={data?.cpu.model} size="lg" />
            <SystemStatusItem title="内核数" value={data?.cpu.core} />
            <SystemStatusItem title="主频" value={data?.cpu.speed} unit="GHz" />
            <SystemStatusItem
              title="使用率"
              value={data?.cpu.usage.system}
              unit="%"
            />
            <SystemStatusItem
              title="QQ主线程"
              value={data?.cpu.usage.qq}
              unit="%"
            />
          </div>
          <h2 className="text-lg font-semibold flex items-center gap-1 text-primary-400 mt-2">
            <BiSolidMemoryCard className="text-xl" />
            <span>内存</span>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <SystemStatusItem
              title="总量"
              value={data?.memory.total}
              size="lg"
              unit="MB"
            />
            <SystemStatusItem
              title="使用量"
              value={data?.memory.usage.system}
              unit="MB"
            />
            <SystemStatusItem
              title="QQ主线程"
              value={data?.memory.usage.qq}
              unit="MB"
            />
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2 flex-shrink-0 w-full justify-center md:w-40 min-h-40 mt-4 md:mt-0 md:mx-auto">
          <UsagePie
            systemUsage={Number(data?.cpu.usage.system) || 0}
            processUsage={Number(data?.cpu.usage.qq) || 0}
            title="CPU占用"
          />
          <UsagePie
            systemUsage={memoryUsage.system}
            processUsage={memoryUsage.qq}
            title="内存占用"
          />
        </div>
      </CardBody>
    </Card>
  )
}
export default SystemStatusDisplay
