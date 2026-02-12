import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Divider } from '@heroui/divider';
import { Chip } from '@heroui/chip';
import { Listbox, ListboxItem } from '@heroui/listbox';
import { Spinner } from '@heroui/spinner';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { MdContentCopy, MdDelete, MdRefresh, MdSave, MdRestorePage, MdBackup } from 'react-icons/md';

import QQManager from '@/controllers/qq_manager';
import useDialog from '@/hooks/use-dialog';

interface GUIDManagerProps {
  /** 是否显示重启按钮 */
  showRestart?: boolean;
  /** 紧凑模式（用于弹窗场景） */
  compact?: boolean;
}

const GUIDManager: React.FC<GUIDManagerProps> = ({ showRestart = true, compact = false }) => {
  const dialog = useDialog();
  const [currentGUID, setCurrentGUID] = useState<string>('');
  const [inputGUID, setInputGUID] = useState<string>('');
  const [backups, setBackups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const isValidGUID = (guid: string) => /^[0-9a-fA-F]{32}$/.test(guid);

  const fetchGUID = useCallback(async () => {
    setLoading(true);
    try {
      const data = await QQManager.getDeviceGUID();
      setCurrentGUID(data.guid);
      setInputGUID(data.guid);
    } catch (error) {
      const msg = (error as Error).message;
      setCurrentGUID('');
      setInputGUID('');
      if (!msg.includes('not found')) {
        toast.error(`获取 GUID 失败: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    try {
      const data = await QQManager.getGUIDBackups();
      setBackups(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchGUID();
    fetchBackups();
  }, [fetchGUID, fetchBackups]);

  const handleCopy = () => {
    if (currentGUID) {
      navigator.clipboard.writeText(currentGUID);
      toast.success('已复制到剪贴板');
    }
  };

  const handleSave = async () => {
    if (!isValidGUID(inputGUID)) {
      toast.error('GUID 格式无效，需要 32 位十六进制字符');
      return;
    }
    setSaving(true);
    try {
      await QQManager.setDeviceGUID(inputGUID);
      setCurrentGUID(inputGUID);
      toast.success('GUID 已设置，重启后生效');
      await fetchBackups();
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`设置 GUID 失败: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    dialog.confirm({
      title: '确认删除',
      content: '删除 Registry20 后，QQ 将在下次启动时生成新的设备标识。确定要删除吗？',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          await QQManager.resetDeviceID();
          setCurrentGUID('');
          setInputGUID('');
          toast.success('已删除，重启后生效');
          await fetchBackups();
        } catch (error) {
          const msg = (error as Error).message;
          toast.error(`删除失败: ${msg}`);
        }
      },
    });
  };

  const handleBackup = async () => {
    try {
      await QQManager.createGUIDBackup();
      toast.success('备份已创建');
      await fetchBackups();
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`备份失败: ${msg}`);
    }
  };

  const handleRestore = (backupName: string) => {
    dialog.confirm({
      title: '确认恢复',
      content: `确定要从备份 "${backupName}" 恢复吗？当前的 Registry20 将被覆盖。`,
      confirmText: '恢复',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          await QQManager.restoreGUIDBackup(backupName);
          toast.success('已恢复，重启后生效');
          await fetchGUID();
          await fetchBackups();
        } catch (error) {
          const msg = (error as Error).message;
          toast.error(`恢复失败: ${msg}`);
        }
      },
    });
  };

  const handleRestart = () => {
    dialog.confirm({
      title: '确认重启',
      content: '确定要重启 NapCat 吗？这将导致当前连接断开。',
      confirmText: '重启',
      cancelText: '取消',
      onConfirm: async () => {
        setRestarting(true);
        try {
          await QQManager.restartNapCat();
          toast.success('重启指令已发送');
        } catch (error) {
          const msg = (error as Error).message;
          toast.error(`重启失败: ${msg}`);
        } finally {
          setRestarting(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Spinner label='加载中...' />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-${compact ? '3' : '4'}`}>
      {/* 当前 GUID 显示 */}
      <div className='flex flex-col gap-2'>
        <div className='text-sm font-medium text-default-700'>当前设备 GUID</div>
        <div className='flex items-center gap-2'>
          {currentGUID ? (
            <Chip variant='flat' color='primary' className='font-mono text-xs max-w-full'>
              {currentGUID}
            </Chip>
          ) : (
            <Chip variant='flat' color='warning' className='text-xs'>
              未设置 / 不存在
            </Chip>
          )}
          {currentGUID && (
            <Button
              isIconOnly
              size='sm'
              variant='light'
              onPress={handleCopy}
              aria-label='复制GUID'
            >
              <MdContentCopy size={16} />
            </Button>
          )}
          <Button
            isIconOnly
            size='sm'
            variant='light'
            onPress={fetchGUID}
            aria-label='刷新'
          >
            <MdRefresh size={16} />
          </Button>
        </div>
      </div>

      <Divider />

      {/* 设置 GUID */}
      <div className='flex flex-col gap-2'>
        <div className='text-sm font-medium text-default-700'>设置 GUID</div>
        <div className='flex items-center gap-2'>
          <Input
            size='sm'
            variant='bordered'
            placeholder='输入32位十六进制 GUID'
            value={inputGUID}
            onValueChange={setInputGUID}
            isInvalid={inputGUID.length > 0 && !isValidGUID(inputGUID)}
            errorMessage={inputGUID.length > 0 && !isValidGUID(inputGUID) ? '需要32位十六进制字符' : undefined}
            classNames={{
              input: 'font-mono text-sm',
            }}
            maxLength={32}
          />
        </div>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            color='primary'
            variant='flat'
            isLoading={saving}
            isDisabled={!isValidGUID(inputGUID) || inputGUID === currentGUID}
            onPress={handleSave}
            startContent={<MdSave size={16} />}
          >
            保存 GUID
          </Button>
          <Button
            size='sm'
            color='danger'
            variant='flat'
            isDisabled={!currentGUID}
            onPress={handleDelete}
            startContent={<MdDelete size={16} />}
          >
            删除 GUID
          </Button>
          <Button
            size='sm'
            color='secondary'
            variant='flat'
            isDisabled={!currentGUID}
            onPress={handleBackup}
            startContent={<MdBackup size={16} />}
          >
            手动备份
          </Button>
        </div>
        <div className='text-xs text-default-400'>
          修改或删除 GUID 后需重启 NapCat 才能生效，操作前会自动备份
        </div>
      </div>

      {/* 备份恢复 */}
      {backups.length > 0 && (
        <>
          <Divider />
          <div className='flex flex-col gap-2'>
            <div className='text-sm font-medium text-default-700'>
              备份列表
              <span className='text-xs text-default-400 ml-2'>（点击恢复）</span>
            </div>
            <div className='max-h-[160px] overflow-y-auto rounded-lg border border-default-200'>
              <Listbox
                aria-label='备份列表'
                selectionMode='none'
                onAction={(key) => handleRestore(key as string)}
              >
                {backups.map((name) => (
                  <ListboxItem
                    key={name}
                    startContent={<MdRestorePage size={16} className='text-default-400' />}
                    className='font-mono text-xs'
                  >
                    {name}
                  </ListboxItem>
                ))}
              </Listbox>
            </div>
          </div>
        </>
      )}

      {/* 重启 */}
      {showRestart && (
        <>
          <Divider />
          <Button
            size='sm'
            color='warning'
            variant='flat'
            isLoading={restarting}
            onPress={handleRestart}
            startContent={<MdRefresh size={16} />}
          >
            重启 NapCat
          </Button>
        </>
      )}
    </div>
  );
};

export default GUIDManager;
