import { BreadcrumbItem, Breadcrumbs } from '@heroui/breadcrumbs';
import { Button } from '@heroui/button';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdMenu, MdMenuOpen } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';

import key from '@/const/key';

import errorFallbackRender from '@/components/error_fallback';
// import PageLoading from "@/components/Loading/PageLoading";
import SideBar from '@/components/sidebar';

import useAuth from '@/hooks/auth';

import type { MenuItem } from '@/config/site';
import { siteConfig } from '@/config/site';
import QQManager from '@/controllers/qq_manager';

const menus: MenuItem[] = siteConfig.navItems;

const findTitle = (menus: MenuItem[], pathname: string): string[] => {
  const paths: string[] = [];

  if (pathname) {
    for (const item of menus) {
      if (item.href === pathname) {
        paths.push(item.label);
      } else if (item.items) {
        const title = findTitle(item.items, pathname);

        if (title.length > 0) {
          paths.push(item.label);
          paths.push(...title);
        }
      }
    }
  }

  return paths;
};
const Layout: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [openSideBar, setOpenSideBar] = useLocalStorage(key.sideBarOpen, true);
  const [b64img] = useLocalStorage(key.backgroundImage, '');
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  const checkIsQQLogin = async () => {
    try {
      const result = await QQManager.checkQQLoginStatus();
      if (!result.isLogin) {
        if (isAuth) {
          navigate('/qq_login', { replace: true });
        } else {
          navigate('/web_login', { replace: true });
        }
      }
    } catch (_error) {
      navigate('/web_login', { replace: true });
    }
  };
  useEffect(() => {
    contentRef?.current?.scrollTo?.({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);
  useEffect(() => {
    if (isAuth) {
      checkIsQQLogin();
    }
  }, [isAuth]);
  const title = useMemo(() => {
    return findTitle(menus, location.pathname);
  }, [location.pathname]);
  return (
    <div
      className='h-screen relative flex items-stretch overflow-hidden'
      style={{
        backgroundImage: b64img ? `url(${b64img})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <SideBar
        items={menus}
        open={openSideBar}
        onClose={() => setOpenSideBar(false)}
      />
      <motion.div
        layout
        ref={contentRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={clsx(
          'flex-1 overflow-y-auto',
          'bg-white/60 dark:bg-black/40 backdrop-blur-xl',
          'shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]',
          'transition-all duration-300 ease-in-out',
          openSideBar ? 'm-3 ml-0 rounded-3xl border border-white/40 dark:border-white/10' : 'm-0 rounded-none',
          'pb-10 md:pb-0'
        )}
      >
        <div
          className={clsx(
            'h-10 flex items-center font-bold text-xl backdrop-blur-lg rounded-full',
            'dark:bg-background dark:shadow-primary-100',
            'bg-background !bg-opacity-50',
            'shadow-sm shadow-primary-50',
            'z-30 m-2 mb-0 sticky top-2 left-0'
          )}
        >
          <div
            className={clsx(
              'mr-1 ease-in-out ml-0 md:relative z-50 md:z-auto',
              openSideBar && 'pl-2',
              'md:!ml-0 md:pl-0'
            )}
          >
            <Button
              isIconOnly
              radius='full'
              variant='light'
              onPress={() => setOpenSideBar(!openSideBar)}
            >
              {openSideBar ? <MdMenuOpen size={24} /> : <MdMenu size={24} />}
            </Button>
          </div>
          <Breadcrumbs isDisabled size='lg'>
            {title?.map((item, index) => (
              <BreadcrumbItem key={index}>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item}
                  </motion.div>
                </AnimatePresence>
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
        </div>
        <ErrorBoundary fallbackRender={errorFallbackRender}>
          {children}
        </ErrorBoundary>
      </motion.div>
    </div>
  );
};

export default Layout;
