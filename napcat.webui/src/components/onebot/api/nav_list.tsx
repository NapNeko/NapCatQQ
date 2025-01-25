import { Card, CardBody } from '@heroui/card'
import { Input } from '@heroui/input'
import clsx from 'clsx'
import { motion } from 'motion/react'
import { useState } from 'react'

import type { OneBotHttpApi, OneBotHttpApiPath } from '@/const/ob_api'

export interface OneBotApiNavListProps {
  data: OneBotHttpApi
  selectedApi: OneBotHttpApiPath
  onSelect: (apiName: OneBotHttpApiPath) => void
  openSideBar: boolean
}

const OneBotApiNavList: React.FC<OneBotApiNavListProps> = (props) => {
  const { data, selectedApi, onSelect, openSideBar } = props
  const [searchValue, setSearchValue] = useState('')
  return (
    <motion.div
      className={clsx(
        'flex-shrink-0 absolute md:!top-0 md:bottom-0 left-0 !overflow-hidden md:relative md:w-auto z-20',
        openSideBar &&
          'bottom-8 z-10 bg-background bg-opacity-20 backdrop-blur-md top-14'
      )}
      initial={{ width: 0 }}
      transition={{
        type: openSideBar ? 'spring' : 'tween',
        stiffness: 150,
        damping: 15
      }}
      animate={{ width: openSideBar ? '16rem' : '0rem' }}
      style={{ overflowY: openSideBar ? 'auto' : 'hidden' }}
    >
      <div className="w-64 h-full overflow-y-auto px-2 float-right">
        <Input
          className="sticky top-0 z-10 text-danger-600"
          classNames={{
            inputWrapper:
              'bg-opacity-30 bg-danger-50 backdrop-blur-sm border border-danger-300 mb-2',
            input: 'bg-transparent !text-danger-400 !placeholder-danger-400'
          }}
          radius="full"
          placeholder="搜索 API"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          isClearable
          onClear={() => setSearchValue('')}
        />
        {Object.entries(data).map(([apiName, api]) => (
          <Card
            key={apiName}
            shadow="none"
            className={clsx(
              'w-full border border-danger-100 rounded-lg mb-1 bg-opacity-30 backdrop-blur-sm text-danger-400',
              {
                hidden: !(
                  apiName.includes(searchValue) ||
                  api.description?.includes(searchValue)
                )
              },
              {
                '!bg-opacity-40 border border-danger-400 bg-danger-50 text-danger-600':
                  apiName === selectedApi
              }
            )}
            isPressable
            onPress={() => onSelect(apiName as OneBotHttpApiPath)}
          >
            <CardBody>
              <h2 className="font-ubuntu font-bold">{api.description}</h2>
              <div
                className={clsx('text-sm text-danger-200', {
                  '!text-danger-400': apiName === selectedApi
                })}
              >
                {apiName}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}

export default OneBotApiNavList
