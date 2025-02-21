import { Card, CardBody } from '@heroui/card'
import clsx from 'clsx'

import { title } from '@/components/primitives'

export interface NetworkItemDisplayProps {
  count: number
  label: string
  size?: 'sm' | 'md'
}

const NetworkItemDisplay: React.FC<NetworkItemDisplayProps> = ({
  count,
  label,
  size = 'md'
}) => {
  return (
    <Card
      className={clsx(
        'bg-opacity-60 shadow-sm md:rounded-3xl',
        size === 'md'
          ? 'col-span-8 md:col-span-2 bg-primary-50 shadow-primary-100'
          : 'col-span-2 md:col-span-1 bg-warning-100 shadow-warning-200'
      )}
      shadow="sm"
    >
      <CardBody className="items-center md:gap-1 p-1 md:p-2">
        <div
          className={clsx(
            'flex-1',
            size === 'md' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl',
            title({
              color: size === 'md' ? 'pink' : 'yellow',
              size
            })
          )}
        >
          {count}
        </div>
        <div
          className={clsx(
            'whitespace-nowrap text-nowrap flex-shrink-0',
            size === 'md' ? 'text-sm md:text-base' : 'text-xs md:text-sm',
            title({
              color: size === 'md' ? 'pink' : 'yellow',
              shadow: true,
              size: 'xxs'
            })
          )}
        >
          {label}
        </div>
      </CardBody>
    </Card>
  )
}

export default NetworkItemDisplay
