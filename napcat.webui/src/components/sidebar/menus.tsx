import type { MenuItem } from '@/config/site'

import { Button } from '@nextui-org/button'
import clsx from 'clsx'
import React from 'react'
import { FaChevronDown } from 'react-icons/fa6'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'

import { useTheme } from '@/hooks/use-theme'

const renderItems = (items: MenuItem[], children = false) => {
  return items?.map((item) => {
    const navigate = useNavigate()
    const locate = useLocation()
    const [open, setOpen] = React.useState(!!item.autoOpen)
    const { isDark } = useTheme()
    const canOpen = React.useMemo(
      () => item.items && item.items.length > 0,
      [item.items]
    )
    const isActive = React.useMemo(() => {
      if (item.href) {
        return !!matchPath(item.href, locate.pathname)
      }

      return false
    }, [item.href, locate.pathname])

    const goTo = (href: string) => {
      navigate(href)
    }

    React.useEffect(() => {
      if (item.items) {
        const shouldOpen = item.items.some(
          (item) => item?.href && !!matchPath(item.href, locate.pathname)
        )

        if (shouldOpen) setOpen(true)
      }
    }, [item.items, locate.pathname])
    const panelRef = React.useRef<HTMLDivElement>(null)

    return (
      <div key={item.href + item.label}>
        <div>
          <Button
            className={clsx(
              'flex items-center w-full text-left justify-start',
              children && 'rounded-l-lg',
              isActive && 'bg-opacity-60',
              isDark && 'text-white'
              // isActive ? "text-danger-900" : "text-content1-foreground",
            )}
            color="danger"
            endContent={
              canOpen ? (
                <FaChevronDown
                  className={clsx('ml-auto transition-transform', {
                    'transform rotate-180': open
                  })}
                />
              ) : (
                <div
                  className={clsx(
                    'w-3 h-1.5 rounded-full ml-auto shadow-lg',
                    isActive
                      ? 'bg-danger-500 animate-spinner-ease-spin'
                      : isDark
                        ? 'bg-white'
                        : 'bg-red-300'
                  )}
                />
              )
            }
            radius="full"
            startContent={item.icon}
            variant={isActive ? 'shadow' : 'light'}
            onClick={() => {
              if (item.href) {
                if (!isActive) {
                  goTo(item.href)
                }
              } else if (canOpen) {
                setOpen(!open)
              }
            }}
          >
            {item.label}
          </Button>
        </div>
        <div
          ref={panelRef}
          className="ml-4 overflow-hidden transition-all duration-300"
          style={{
            height: open ? panelRef.current?.scrollHeight : 0
          }}
        >
          {item.items && renderItems(item.items, true)}
        </div>
      </div>
    )
  })
}

interface MenusProps {
  items: MenuItem[]
}
const Menus: React.FC<MenusProps> = (props) => {
  const { items } = props

  return (
    <div className="flex flex-col justify-content-center flex-1 gap-2">
      {renderItems(items)}
    </div>
  )
}

export default Menus
