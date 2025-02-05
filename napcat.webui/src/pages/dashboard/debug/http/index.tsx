import { Button } from '@heroui/button'
import clsx from 'clsx'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { TbSquareRoundedChevronLeftFilled } from 'react-icons/tb'

import oneBotHttpApi from '@/const/ob_api'
import type { OneBotHttpApi } from '@/const/ob_api'

import OneBotApiDebug from '@/components/onebot/api/debug'
import OneBotApiNavList from '@/components/onebot/api/nav_list'

export default function HttpDebug() {
  const [selectedApi, setSelectedApi] =
    useState<keyof OneBotHttpApi>('/set_qq_profile')
  const data = oneBotHttpApi[selectedApi]
  const contentRef = useRef<HTMLDivElement>(null)
  const [openSideBar, setOpenSideBar] = useState(true)

  useEffect(() => {
    contentRef?.current?.scrollTo?.({
      top: 0,
      behavior: 'smooth'
    })
  }, [selectedApi])

  return (
    <>
      <title>HTTP调试 - NapCat WebUI</title>
      <OneBotApiNavList
        data={oneBotHttpApi}
        selectedApi={selectedApi}
        onSelect={setSelectedApi}
        openSideBar={openSideBar}
      />
      <div ref={contentRef} className="flex-1 h-full overflow-x-hidden">
        <motion.div
          className="absolute top-16 z-30 md:!ml-4"
          animate={{ marginLeft: openSideBar ? '16rem' : '1rem' }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        >
          <Button
            isIconOnly
            color="primary"
            radius="md"
            variant="shadow"
            size="sm"
            onPress={() => setOpenSideBar(!openSideBar)}
          >
            <TbSquareRoundedChevronLeftFilled
              size={24}
              className={clsx(
                'transition-transform',
                openSideBar ? '' : 'transform rotate-180'
              )}
            />
          </Button>
        </motion.div>
        <OneBotApiDebug path={selectedApi} data={data} />
      </div>
    </>
  )
}
