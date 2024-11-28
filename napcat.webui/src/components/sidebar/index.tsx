import type { MenuItem } from '@/config/site'

import React from 'react'
import { Button } from '@nextui-org/button'
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import clsx from 'clsx'
import { Image } from '@nextui-org/image'

import { title } from '../primitives'

import Menus from './menus'

import logo from '@/assets/images/logo.png'
import { useTheme } from '@/hooks/use-theme'

interface SideBarProps {
  open: boolean
  items: MenuItem[]
}

const SideBar: React.FC<SideBarProps> = (props) => {
  const { open, items } = props
  const { toggleTheme, isDark } = useTheme()

  return (
    <div
      className={clsx(
        'overflow-hidden transition-width',
        open ? 'w-64' : 'w-0'
      )}
    >
      <div className="w-64 flex flex-col items-stretch h-full transition-transform duration-300 ease-in-out z-30 relative">
        <div className="flex justify-center items-center mt-1">
          <Image className="-mt-3" height={80} src={logo} />
          <div
            className={clsx(
              'flex items-center font-bold',
              title({
                shadow: true,
                color: isDark ? 'violet' : 'pink'
              }),
              '!text-2xl'
            )}
          >
            WebUI
          </div>
        </div>
        <div className="overflow-y-auto flex flex-col flex-1 px-4">
          <Menus items={items} />
          <div className="mt-auto">
            <Button
              className="w-full mb-2"
              color="danger"
              radius="full"
              variant="light"
              onClick={toggleTheme}
            >
              {!isDark ? <MdLightMode size={16} /> : <MdDarkMode size={16} />}
              切换主题
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBar
