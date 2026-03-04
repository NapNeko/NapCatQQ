import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TbCornerDownLeft, TbSearch } from 'react-icons/tb';

export type CommandPaletteCommand = {
  id: string;
  title: string;
  subtitle?: string;
  group?: string;
};

export type CommandPaletteExecuteMode = 'open' | 'send';

export interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandPaletteCommand[];
  onExecute: (commandId: string, mode: CommandPaletteExecuteMode) => void;
}

const isMobileByViewport = () => {
  try {
    return window.innerWidth < 768;
  } catch {
    return false;
  }
};

export default function CommandPalette (props: CommandPaletteProps) {
  const { isOpen, onOpenChange, commands, onExecute } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const update = () => setMobile(isMobileByViewport());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActiveIndex(0);
    // 等 Modal 动画挂载后再 focus
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? commands
      : commands.filter((c) => {
          const hay = `${c.id} ${c.title} ${c.subtitle ?? ''} ${c.group ?? ''}`.toLowerCase();
          return hay.includes(q);
        });

    // 简单：优先 path 前缀命中
    if (!q) return list;
    const starts = list.filter((c) => c.id.toLowerCase().startsWith(q));
    const rest = list.filter((c) => !c.id.toLowerCase().startsWith(q));
    return [...starts, ...rest];
  }, [commands, query]);

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered.length, activeIndex]);

  const active = filtered[activeIndex];

  const exec = (mode: CommandPaletteExecuteMode) => {
    if (!active) return;
    onExecute(active.id, mode);
    onOpenChange(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // Shift+Enter 仅打开；Enter 打开并发送
      exec(e.shiftKey ? 'open' : 'send');
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size={mobile ? 'full' : '2xl'}
      radius={mobile ? 'none' : 'lg'}
      scrollBehavior='inside'
      backdrop='blur'
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className={clsx(
              'flex items-center gap-2',
              mobile ? 'border-b border-default-200/50' : ''
            )}>
              <span className='text-sm font-semibold'>命令面板</span>
              <span className='text-xs text-default-400 font-normal hidden md:inline'>Ctrl/Cmd + K</span>
            </ModalHeader>
            <ModalBody className={clsx('gap-3', mobile ? 'p-3' : 'p-4')}>
              <Input
                ref={inputRef as any}
                autoFocus
                value={query}
                onValueChange={setQuery}
                onKeyDown={onKeyDown}
                placeholder='输入 /set_xxx 或 描述…  Enter：打开并发送，Shift+Enter：仅打开'
                startContent={<TbSearch className='opacity-40' size={16} />}
                radius='lg'
                variant='flat'
                classNames={{
                  inputWrapper: 'bg-content2/50 border border-default-200/50 dark:border-default-100/20',
                  input: 'text-sm',
                }}
              />

              <div className={clsx(
                'rounded-xl border border-default-200/50 dark:border-default-100/20 overflow-hidden',
                mobile ? 'flex-1 min-h-0' : 'max-h-[420px]'
              )}>
                <div className={clsx(
                  'divide-y divide-default-200/50 dark:divide-default-100/20 overflow-y-auto no-scrollbar',
                  mobile ? 'h-full' : 'max-h-[420px]'
                )}>
                  {filtered.length === 0 && (
                    <div className='p-6 text-sm text-default-400'>没有匹配的接口</div>
                  )}
                  {filtered.map((c, idx) => (
                    <button
                      key={c.id}
                      type='button'
                      className={clsx(
                        'w-full text-left px-4 py-3 transition-colors flex items-center gap-3',
                        idx === activeIndex
                          ? 'bg-primary/10'
                          : 'hover:bg-default-100/50 dark:hover:bg-default-50/10'
                      )}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        setActiveIndex(idx);
                        exec('open');
                      }}
                    >
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2 min-w-0'>
                          <span className='text-xs font-mono text-default-500 truncate'>{c.id}</span>
                          {c.group && (
                            <span className='text-[10px] px-2 py-0.5 rounded-full bg-default-100/60 dark:bg-default-50/20 text-default-500'>
                              {c.group}
                            </span>
                          )}
                        </div>
                        <div className='text-sm text-default-700 dark:text-default-200 truncate'>{c.title}</div>
                        {c.subtitle && (
                          <div className='text-xs text-default-400 truncate'>{c.subtitle}</div>
                        )}
                      </div>
                      <div className='flex items-center gap-2 flex-shrink-0'>
                        <span className='hidden md:inline text-[10px] text-default-400'>Enter</span>
                        <TbCornerDownLeft className='opacity-40' size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </ModalBody>
            {mobile && (
              <ModalFooter className='border-t border-default-200/50'>
                <Button radius='full' variant='flat' onPress={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button
                  radius='full'
                  variant='flat'
                  color='primary'
                  isDisabled={!active}
                  onPress={() => exec('open')}
                >
                  打开
                </Button>
                <Button
                  radius='full'
                  color='primary'
                  isDisabled={!active}
                  onPress={() => exec('send')}
                >
                  打开并发送
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
