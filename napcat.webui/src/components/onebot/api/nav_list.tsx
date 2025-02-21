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
        'h-[calc(100vh-3.5rem)] left-0 !overflow-hidden md:w-auto z-20 top-[3.3rem] md:top-[3rem] absolute md:sticky md:float-start',
        openSideBar && 'bg-background bg-opacity-20 backdrop-blur-md'
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
      <div className="w-64 h-full overflow-y-auto px-2 pt-2 pb-10 md:pb-0">
        <Input
          className="sticky top-0 z-10 text-primary-600"
          classNames={{
            inputWrapper:
              'bg-opacity-30 bg-primary-50 backdrop-blur-sm border border-primary-300 mb-2',
            input: 'bg-transparent !text-primary-400 !placeholder-primary-400'
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
              'w-full border border-primary-100 rounded-lg mb-1 bg-opacity-30 backdrop-blur-sm text-primary-400',
              {
                hidden: !(
                  apiName.includes(searchValue) ||
                  api.description?.includes(searchValue)
                )
              },
              {
                '!bg-opacity-40 border border-primary-400 bg-primary-50 text-primary-600':
                  apiName === selectedApi
              }
            )}
            isPressable
            onPress={() => onSelect(apiName as OneBotHttpApiPath)}
          >
            <CardBody>
              <h2 className="font-bold">{api.description}</h2>
              <div
                className={clsx('text-sm text-primary-200', {
                  '!text-primary-400': apiName === selectedApi
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
