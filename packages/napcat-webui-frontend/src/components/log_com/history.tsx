import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Select, SelectItem } from '@heroui/select';
import type { Selection } from '@react-types/shared';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import key from '@/const/key';
import { colorizeLogLevel } from '@/utils/terminal';

import PageLoading from '../page_loading';
import XTerm from '../xterm';
import type { XTermRef } from '../xterm';
import LogLevelSelect from './log_level_select';

export interface HistoryLogsProps {
  list: string[];
  onSelect: (name: string) => void;
  selectedLog?: string;
  refreshList: () => void;
  refreshLog: () => void;
  listLoading?: boolean;
  logLoading?: boolean;
  listError?: Error;
  logContent?: string;
}
const HistoryLogs: React.FC<HistoryLogsProps> = (props) => {
  const {
    list,
    onSelect,
    selectedLog,
    refreshList,
    refreshLog,
    listLoading,
    logContent,
    listError,
    logLoading,
  } = props;
  const Xterm = useRef<XTermRef>(null);

  const [logLevel, setLogLevel] = useState<Selection>(
    new Set(['info', 'warn', 'error'])
  );
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  const logToColored = (log: string) => {
    const logs = log
      .split('\n')
      .map((line) => {
        const colored = colorizeLogLevel(line);
        return colored;
      })
      .filter((log) => {
        if (logLevel === 'all') {
          return true;
        }
        return logLevel.has(log.level);
      })
      .map((log) => log.content)
      .join('\r\n');
    return logs;
  };

  const onDownloadLog = () => {
    if (!logContent) {
      return;
    }
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLog}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!Xterm.current || !logContent) {
      return;
    }
    Xterm.current.clear();
    const _logContent = logToColored(logContent);
    Xterm.current.write(_logContent + '\r\nnapcat@webui:~$ ');
  }, [logContent, logLevel]);

  return (
    <>
      <title>历史日志 - NapCat WebUI</title>
      <Card className={clsx(
        'max-w-full h-full backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-sm',
        hasBackground ? 'bg-white/20 dark:bg-black/10' : 'bg-white/60 dark:bg-black/40'
      )}>
        <CardHeader className='flex-row justify-start gap-3'>
          <Select
            label='选择日志'
            size='sm'
            isLoading={listLoading}
            errorMessage={listError?.message}
            classNames={{
              trigger:
                'bg-default-100/50 backdrop-blur-sm hover:!bg-default-200/50',
            }}
            placeholder='选择日志'
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                return;
              }
              onSelect(value);
            }}
            selectedKeys={[selectedLog || '']}
            items={list.map((name) => ({
              value: name,
              label: name,
            }))}
          >
            {(item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            )}
          </Select>
          <LogLevelSelect
            selectedKeys={logLevel}
            onSelectionChange={setLogLevel}
          />
          <div className='flex gap-2 ml-auto'>
            <Button className='flex-shrink-0' onPress={onDownloadLog} size='sm' variant='flat' color='primary'>
              下载日志
            </Button>
            <Button onPress={refreshList} size='sm' variant='flat'>刷新列表</Button>
            <Button onPress={refreshLog} size='sm' variant='flat'>刷新日志</Button>
          </div>
        </CardHeader>
        <CardBody className='relative'>
          <PageLoading loading={logLoading} />
          <XTerm className='w-full h-full' ref={Xterm} />
        </CardBody>
      </Card>
    </>
  );
};

export default HistoryLogs;
