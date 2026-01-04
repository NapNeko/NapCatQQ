import { Input } from '@heroui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { TbChevronRight, TbFolder, TbSearch } from 'react-icons/tb';

import key from '@/const/key';
import oneBotHttpApiGroup from '@/const/ob_api/group';
import oneBotHttpApiMessage from '@/const/ob_api/message';
import oneBotHttpApiSystem from '@/const/ob_api/system';
import oneBotHttpApiUser from '@/const/ob_api/user';
import type { OneBotHttpApi, OneBotHttpApiPath } from '@/const/ob_api';

export interface OneBotApiNavListProps {
  data: OneBotHttpApi;
  selectedApi: OneBotHttpApiPath;
  onSelect: (apiName: OneBotHttpApiPath) => void;
  openSideBar: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const OneBotApiNavList: React.FC<OneBotApiNavListProps> = (props) => {
  const { data, selectedApi, onSelect, openSideBar, onToggle } = props;
  const [searchValue, setSearchValue] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  const groups = useMemo(() => {
    const rawGroups = [
      { id: 'user', label: '账号相关', keys: Object.keys(oneBotHttpApiUser) },
      { id: 'message', label: '消息相关', keys: Object.keys(oneBotHttpApiMessage) },
      { id: 'group', label: '群聊相关', keys: Object.keys(oneBotHttpApiGroup) },
      { id: 'system', label: '系统操作', keys: Object.keys(oneBotHttpApiSystem) },
    ];

    return rawGroups.map(g => {
      const apis = g.keys
        .filter(k => k in data)
        .map(k => ({ path: k as OneBotHttpApiPath, ...data[k as OneBotHttpApiPath] }))
        .filter(api =>
          api.path.toLowerCase().includes(searchValue.toLowerCase()) ||
          api.description?.toLowerCase().includes(searchValue.toLowerCase())
        );
      return { ...g, apis };
    }).filter(g => g.apis.length > 0);
  }, [data, searchValue]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* Mobile backdrop overlay - below header (z-40) */}
      <AnimatePresence>
        {openSideBar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-30 md:hidden"
            onClick={() => onToggle?.(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={clsx(
          'h-full z-40 flex-shrink-0 border-r border-white/10 dark:border-white/5 overflow-hidden transition-all',
          // Mobile: absolute position, drawer style
          // Desktop: relative position, pushing content
          'absolute md:relative left-0 top-0',
          hasBackground
            ? 'bg-white/10 dark:bg-black/40 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none'
            : 'bg-white/80 dark:bg-black/40 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none'
        )}
        initial={false}
        animate={{
          width: openSideBar ? 260 : 0,
          opacity: openSideBar ? 1 : 0,
          x: (window.innerWidth < 768 && !openSideBar) ? -260 : 0  // Optional: slide out completely on mobile
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className='w-[260px] h-full flex flex-col'>
          <div className='p-3'>
            <Input
              classNames={{
                inputWrapper:
                  'bg-white/5 dark:bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-none',
                input: 'bg-transparent text-xs placeholder:opacity-30',
              }}
              isClearable
              radius='lg'
              placeholder='搜索接口...'
              startContent={<TbSearch size={14} className="opacity-30" />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
              size="sm"
            />
          </div>

          <div className='flex-1 px-2 pb-4 flex flex-col gap-1 overflow-y-auto no-scrollbar'>
            {groups.map((group) => {
              const isOpen = expandedGroups.includes(group.id) || searchValue.length > 0;
              return (
                <div key={group.id} className="flex flex-col">
                  {/* Group Header */}
                  <div
                    className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-all group/header"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <TbChevronRight
                      size={12}
                      className={clsx(
                        'transition-transform duration-200 opacity-20 group-hover/header:opacity-50',
                        isOpen && 'rotate-90'
                      )}
                    />
                    <TbFolder className="text-primary/60" size={16} />
                    <span className="text-[13px] font-medium opacity-70 flex-1">{group.label}</span>
                    <span className="text-[11px] opacity-20 font-mono tracking-tighter">({group.apis.length})</span>
                  </div>

                  {/* Group Content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden flex flex-col gap-1 ml-4 border-l border-white/5 pl-2 my-1"
                      >
                        {group.apis.map((api) => {
                          const isSelected = api.path === selectedApi;
                          return (
                            <div
                              key={api.path}
                              onClick={() => onSelect(api.path)}
                              className={clsx(
                                'flex flex-col gap-0.5 px-3 py-2 rounded-lg cursor-pointer transition-all border select-none',
                                isSelected
                                  ? (hasBackground 
                                      ? 'bg-white/10 border-white/20' 
                                      : 'bg-primary/10 border-primary/20 shadow-sm')
                                  : 'border-transparent hover:bg-white/10 dark:hover:bg-white/5'
                              )}
                            >
                              <span className={clsx(
                                'text-[12px] font-medium transition-colors truncate',
                                isSelected ? 'text-primary' : 'opacity-70'
                              )}>
                                {api.description}
                              </span>
                              <span className={clsx(
                                'text-[10px] font-mono truncate transition-all',
                                isSelected ? 'text-primary/60' : 'opacity-30'
                              )}>
                                {api.path}
                              </span>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default OneBotApiNavList;
