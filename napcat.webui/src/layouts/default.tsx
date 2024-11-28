import type { MenuItem } from '@/config/site'

import React from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@nextui-org/button'
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/breadcrumbs'
import clsx from 'clsx'
import { MdMenu, MdMenuOpen } from 'react-icons/md'
import { ErrorBoundary } from 'react-error-boundary'

// import PageLoading from "@/components/Loading/PageLoading";
import SideBar from '@/components/sidebar'
import { useTheme } from '@/hooks/use-theme'
import errorFallbackRender from '@/components/error_fallback'
import { siteConfig } from '@/config/site'

const menus: MenuItem[] = siteConfig.navItems

const findTitle = (menus: MenuItem[], pathname: string): string[] => {
  const paths: string[] = []

  if (pathname) {
    for (const item of menus) {
      if (item.href === pathname) {
        paths.push(item.label)
      } else if (item.items) {
        const title = findTitle(item.items, pathname)

        if (title.length > 0) {
          paths.push(item.label)
          paths.push(...title)
        }
      }
    }
  }

  return paths
}
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [openSideBar, setOpenSideBar] = React.useState(true)
  const { isDark } = useTheme()

  React.useEffect(() => {
    contentRef?.current?.scrollTo?.({
      top: 0,
      behavior: 'smooth'
    })
  }, [location.pathname])
  const title = React.useMemo(() => {
    return findTitle(menus, location.pathname)
  }, [location.pathname])

  return (
    <div
      className={clsx(
        'h-screen relative flex',
        // isDark ? "bg-content1" : "bg-content1-foreground",
        isDark ? 'bg-black' : 'bg-danger-50'
      )}
    >
      <SideBar items={menus} open={openSideBar} />
      <div
        ref={contentRef}
        className={clsx(
          'overflow-y-auto relative flex-1 rounded-md m-1 shadow-inner',
          openSideBar ? 'ml-0' : 'ml-1',
          isDark
            ? 'bg-content1 shadow-danger-50'
            : 'bg-background shadow-danger-200'
        )}
      >
        <div
          className={clsx(
            'h-10 flex items-center font-bold text-xl sticky top-0 left-0 backdrop-blur-lg bg-opacity-80 z-20 shadow-sm',
            isDark ? 'bg-background bg-opacity-30' : 'bg-background',
            isDark ? 'shadow-danger-100' : 'shadow-danger-50'
          )}
        >
          <Button
            isIconOnly
            className="mr-1"
            radius="none"
            variant="light"
            onClick={() => setOpenSideBar(!openSideBar)}
          >
            {openSideBar ? <MdMenuOpen size={24} /> : <MdMenu size={24} />}
          </Button>
          <Breadcrumbs isDisabled size="lg">
            {title?.map((item, index) => (
              <BreadcrumbItem key={index}>{item}</BreadcrumbItem>
            ))}
          </Breadcrumbs>
        </div>
        <ErrorBoundary fallbackRender={errorFallbackRender}>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default Layout
