import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import clsx from 'clsx'

import { title } from '../primitives'

export interface ContainerProps {
  title: string
  tag?: React.ReactNode
  action: React.ReactNode
  enableSwitch: React.ReactNode
  children: React.ReactNode
}

export interface DisplayCardProps {
  showType?: boolean
  onEdit: () => void
  onEnable: () => Promise<void>
  onDelete: () => Promise<void>
  onEnableDebug: () => Promise<void>
}

const DisplayCardContainer: React.FC<ContainerProps> = ({
  title: _title,
  action,
  tag,
  enableSwitch,
  children
}) => {
  return (
    <Card className="bg-opacity-50 backdrop-blur-sm">
      <CardHeader className={'pb-0 flex items-center'}>
        {tag && (
          <div className="text-center text-default-400 mb-1 absolute top-0 left-1/2 -translate-x-1/2 text-sm pointer-events-none bg-warning-100 dark:bg-warning-50 px-2 rounded-b">
            {tag}
          </div>
        )}
        <h2
          className={clsx(
            title({
              color: 'foreground',
              size: 'xs',
              shadow: true
            }),
            'truncate'
          )}
        >
          {_title}
        </h2>
        <div className="ml-auto">{enableSwitch}</div>
      </CardHeader>
      <CardBody className="text-sm">{children}</CardBody>
      <CardFooter>{action}</CardFooter>
    </Card>
  )
}

export default DisplayCardContainer
