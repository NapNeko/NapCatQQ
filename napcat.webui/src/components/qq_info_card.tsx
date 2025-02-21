import { Card, CardBody } from '@heroui/card'
import { Image } from '@heroui/image'
import clsx from 'clsx'
import { BsTencentQq } from 'react-icons/bs'

import { SelfInfo } from '@/types/user'

import PageLoading from './page_loading'

export interface QQInfoCardProps {
  data?: SelfInfo
  error?: Error
  loading?: boolean
}

const QQInfoCard: React.FC<QQInfoCardProps> = ({ data, error, loading }) => {
  return (
    <Card
      className="relative bg-primary-100 bg-opacity-60 overflow-hidden flex-shrink-0 shadow-md shadow-primary-300 dark:shadow-primary-50"
      shadow="none"
      radius="lg"
    >
      <PageLoading loading={loading} />
      {error ? (
        <CardBody className="items-center gap-1 justify-center">
          <div className="flex-1 text-content1-foreground">Error</div>
          <div className="whitespace-nowrap text-nowrap flex-shrink-0">
            {error.message}
          </div>
        </CardBody>
      ) : (
        <CardBody className="flex-row items-center gap-2 overflow-hidden relative">
          <div className="absolute right-0 bottom-0 text-5xl text-primary-400">
            <BsTencentQq />
          </div>
          <div className="relative flex-shrink-0 z-10">
            <Image
              src={
                data?.avatarUrl ??
                `https://q1.qlogo.cn/g?b=qq&nk=${data?.uin}&s=1`
              }
              className="shadow-md rounded-full w-12 aspect-square"
            />
            <div
              className={clsx(
                'w-4 h-4 rounded-full absolute right-0.5 bottom-0 border-2 border-primary-100 z-10',
                data?.online ? 'bg-green-500' : 'bg-gray-500'
              )}
            ></div>
          </div>
          <div className="flex-col justify-center">
            <div className="text-lg truncate">{data?.nick}</div>
            <div className="text-primary-500 text-sm">{data?.uin}</div>
          </div>
        </CardBody>
      )}
    </Card>
  )
}

export default QQInfoCard
