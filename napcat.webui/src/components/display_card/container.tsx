import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card'
import clsx from 'clsx'

import { title } from '../primitives'
export interface ContainerProps {
  title: string
  action: React.ReactNode
  enableSwitch: React.ReactNode
  children: React.ReactNode
}

const DisplayCardContainer: React.FC<ContainerProps> = ({
  title: _title,
  action,
  enableSwitch,
  children
}) => {
  return (
    <Card>
      <CardHeader className={'pb-0 flex items-center'}>
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
