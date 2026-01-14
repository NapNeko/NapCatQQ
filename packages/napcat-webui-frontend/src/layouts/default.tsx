import { BreadcrumbItem, Breadcrumbs } from '@heroui/breadcrumbs';
import { Button } from '@heroui/button';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdMenu, MdMenuOpen } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';

import key from '@/const/key';

import errorFallbackRender from '@/components/error_fallback';
import PageLoading from '@/components/page_loading';
import SideBar from '@/components/sidebar';

import useAuth from '@/hooks/auth';
import useDialog from '@/hooks/use-dialog';

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
  const { isAuth, revokeAuth } = useAuth();
  const dialog = useDialog();
  const isOnlineRef = useRef(true);
  const [isRestarting, setIsRestarting] = useState(false);

  // 定期检查 QQ 在线状态，掉线时弹窗提示
  useEffect(() => {
    if (!isAuth) return;
    const checkOnlineStatus = async () => {
      const currentPath = location.pathname;
      if (currentPath === '/qq_login' || currentPath === '/web_login') return;
      try {
        const info = await QQManager.getQQLoginInfo();
        if (info?.online === false && isOnlineRef.current === true) {
          isOnlineRef.current = false;
          dialog.confirm({
            title: '账号已离线',
            content: '您的 QQ 账号已下线，请重新登录。',
            confirmText: '重新登陆',
            cancelText: '退出账户',
            onConfirm: async () => {
              setIsRestarting(true);
              try {
                await QQManager.reboot();
              } catch (_e) {
                // 忽略错误，因为后端正在重启关闭连接
              }

              // 开始轮询探测后端是否启动
              const startTime = Date.now();
              const maxWaitTime = 15000; // 15秒总超时

              const timer = setInterval(async () => {
                try {
                  // 尝试请求后端，设置一个较短的请求超时避免挂起
                  await QQManager.getQQLoginInfo({ timeout: 500 });
                  // 如果能走到这一步说明请求成功了
                  clearInterval(timer);
                  setIsRestarting(false);
                  window.location.reload();
                } catch (_e) {
                  // 如果请求失败（后端没起来），检查是否超时
                  if (Date.now() - startTime > maxWaitTime) {
                    clearInterval(timer);
                    setIsRestarting(false);
                    dialog.alert({
                      title: '启动超时',
                      content: '后端在 15 秒内未响应，请检查 NapCat 运行日志或手动重启。',
                    });
                  }
                }
              }, 500); // 每 500ms 探测一次
            },
            onCancel: () => {
              revokeAuth();
              navigate('/web_login');
            },
          });
        } else if (info?.online === true) {
          isOnlineRef.current = true;
        }
      } catch (_e) {
        // 忽略请求错误
      }
    };
    const timer = setInterval(checkOnlineStatus, 5000);
    checkOnlineStatus();
    return () => clearInterval(timer);
  }, [isAuth, location.pathname]);

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
      <PageLoading loading={isRestarting} />
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
          'transition-all duration-300 ease-in-out',
          openSideBar ? 'ml-0' : 'ml-0',
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
