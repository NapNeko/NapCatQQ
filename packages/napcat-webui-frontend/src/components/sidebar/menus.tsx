import { Button } from '@heroui/button';
import { Image } from '@heroui/image';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import React from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

import key from '@/const/key';

import type { MenuItem } from '@/config/site';

const renderItems = (items: MenuItem[], children = false) => {
  return items?.map((item) => {
    const navigate = useNavigate();
    const locate = useLocation();
    const [open, setOpen] = React.useState(!!item.autoOpen);
    const canOpen = React.useMemo(
      () => item.items && item.items.length > 0,
      [item.items]
    );
    const [b64img] = useLocalStorage(key.backgroundImage, '');
    const [customIcons] = useLocalStorage<Record<string, string>>(
      key.customIcons,
      {}
    );
    const isActive = React.useMemo(() => {
      if (item.href) {
        return !!matchPath(item.href, locate.pathname);
      }

      return false;
    }, [item.href, locate.pathname]);

    const goTo = (href: string) => {
      navigate(href);
    };

    React.useEffect(() => {
      if (item.items) {
        const shouldOpen = item.items.some(
          (item) => item?.href && !!matchPath(item.href, locate.pathname)
        );

        if (shouldOpen) setOpen(true);
      }
    }, [item.items, locate.pathname]);
    const panelRef = React.useRef<HTMLDivElement>(null);

    return (
      <div key={item.href + item.label}>
        <Button
          className={clsx(
            'flex items-center w-full text-left justify-start dark:text-white transition-all duration-300',
            isActive
              ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 shadow-none font-semibold translate-x-1'
              : 'hover:bg-default-100 hover:translate-x-1',
            b64img && 'backdrop-blur-md text-white dark:text-white'
          )}
          color={isActive ? 'primary' : 'default'}
          endContent={
            canOpen
              ? (
                <div
                  className={clsx(
                    'ml-auto relative w-3 h-3 transition-transform',
                    open && 'transform rotate-180',
                    isActive
                      ? 'text-primary-500'
                      : 'text-primary-200 dark:text-white',
                    'before:rounded-full',
                    'before:content-[""]',
                    'before:block',
                    'before:absolute',
                    'before:w-3',
                    'before:h-[4.5px]',
                    'before:bg-current',
                    'before:top-1/2',
                    'before:-left-[3px]',
                    'before:transform',
                    'before:-translate-y-1/2',
                    'before:rotate-45',
                    'after:rounded-full',
                    'after:content-[""]',
                    'after:block',
                    'after:absolute',
                    'after:w-3',
                    'after:h-[4.5px]',
                    'after:bg-current',
                    'after:top-1/2',
                    'after:left-[3px]',
                    'after:transform',
                    'after:-translate-y-1/2',
                    'after:-rotate-45'
                  )}
                />
              )
              : (
                <div
                  className={clsx(
                    'w-3 h-1.5 rounded-full ml-auto',
                    isActive
                      ? 'bg-primary-500 animate-nav-spin'
                      : 'bg-primary-200 dark:bg-white shadow-lg'
                  )}
                  aria-hidden="true"
                />
              )
          }
          startContent={
            customIcons[item.label]
              ? (
                <Image
                  radius='none'
                  src={customIcons[item.label]}
                  alt={item.label}
                  className='w-5 h-5'
                />
              )
              : (
                item.icon
              )
          }
          variant={isActive ? (children ? 'solid' : 'shadow') : 'light'}
          onPress={() => {
            if (item.href) {
              if (!isActive) {
                goTo(item.href);
              }
            } else if (canOpen) {
              setOpen(!open);
            }
          }}
        >
          {item.label}
        </Button>
        <div
          ref={panelRef}
          className='ml-4 overflow-hidden transition-all duration-300'
          style={{
            height: open ? panelRef.current?.scrollHeight : 0,
          }}
        >
          {item.items && renderItems(item.items, true)}
        </div>
      </div>
    );
  });
};

interface MenusProps {
  items: MenuItem[];
}
const Menus: React.FC<MenusProps> = (props) => {
  const { items } = props;

  return (
    <div className='flex flex-col justify-content-center flex-1 gap-2'>
      {renderItems(items)}
    </div>
  );
};

export default Menus;
