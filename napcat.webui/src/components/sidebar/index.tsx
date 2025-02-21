import { Button } from '@heroui/button'
import { Image } from '@heroui/image'
import clsx from 'clsx'
import { motion } from 'motion/react'
import React from 'react'
import { IoMdLogOut } from 'react-icons/io'
import { MdDarkMode, MdLightMode } from 'react-icons/md'

import useAuth from '@/hooks/auth'
import useDialog from '@/hooks/use-dialog'
import { useTheme } from '@/hooks/use-theme'

import logo from '@/assets/images/logo.png'
import type { MenuItem } from '@/config/site'

import Menus from './menus'

interface SideBarProps {
  open: boolean
  items: MenuItem[]
}

const SideBar: React.FC<SideBarProps> = (props) => {
  const { open, items } = props
  const { toggleTheme, isDark } = useTheme()
  const { revokeAuth } = useAuth()
  const dialog = useDialog()
  const onRevokeAuth = () => {
    dialog.confirm({
      title: '退出登录',
      content: '确定要退出登录吗？',
      onConfirm: revokeAuth
    })
  }
  return (
    <motion.div
      className={clsx(
        'overflow-hidden fixed top-0 left-0 h-full z-50 bg-background md:bg-transparent md:static shadow-md md:shadow-none rounded-r-md md:rounded-none'
      )}
      initial={{ width: 0 }}
      animate={{ width: open ? '16rem' : 0 }}
      transition={{
        type: open ? 'spring' : 'tween',
        stiffness: 150,
        damping: open ? 15 : 10
      }}
      style={{ overflow: 'hidden' }}
    >
      <motion.div className="w-64 flex flex-col items-stretch h-full transition-transform duration-300 ease-in-out z-30 relative float-right">
        <div className="flex justify-center items-center my-2 gap-2">
          <Image radius="none" height={40} src={logo} className="mb-2" />
          <div
            className={clsx(
              'flex items-center font-bold',
              '!text-2xl shiny-text'
            )}
          >
            NapCat
          </div>
        </div>
        <div className="overflow-y-auto flex flex-col flex-1 px-4">
          <Menus items={items} />
          <div className="mt-auto mb-10 md:mb-0">
            <Button
              className="w-full"
              color="primary"
              radius="full"
              variant="light"
              onPress={toggleTheme}
              startContent={
                !isDark ? <MdLightMode size={16} /> : <MdDarkMode size={16} />
              }
            >
              切换主题
            </Button>
            <Button
              className="w-full mb-2"
              color="primary"
              radius="full"
              variant="light"
              onPress={onRevokeAuth}
              startContent={<IoMdLogOut size={16} />}
            >
              退出登录
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SideBar
