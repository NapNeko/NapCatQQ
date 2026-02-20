import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Divider } from '@heroui/divider';
import { Chip } from '@heroui/chip';
import { Listbox, ListboxItem } from '@heroui/listbox';
import { Spinner } from '@heroui/spinner';
import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { MdContentCopy, MdDelete, MdRefresh, MdSave, MdRestorePage, MdBackup } from 'react-icons/md';
import MD5 from 'crypto-js/md5';

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

  // 平台检测
  const [platform, setPlatform] = useState<string>('');
  const isWindows = platform === 'win32';
  const isMac = platform === 'darwin';
  const isLinux = platform !== '' && platform !== 'win32' && platform !== 'darwin';
  const platformDetected = platform !== '';

  // Windows 状态
  const [currentGUID, setCurrentGUID] = useState<string>('');
  const [inputGUID, setInputGUID] = useState<string>('');
  const [backups, setBackups] = useState<string[]>([]);

  // Linux 状态
  const [currentMAC, setCurrentMAC] = useState<string>('');
  const [inputMAC, setInputMAC] = useState<string>('');
  const [machineId, setMachineId] = useState<string>('');
  const [linuxBackups, setLinuxBackups] = useState<string[]>([]);

  // 通用状态
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const isValidGUID = (guid: string) => /^[0-9a-fA-F]{32}$/.test(guid);
  const isValidMAC = (mac: string) => /^[0-9a-fA-F]{2}(-[0-9a-fA-F]{2}){5}$/.test(mac.trim().toLowerCase());

  // 前端实时计算 Linux GUID = MD5(machine-id + MAC)
  const computedLinuxGUID = useMemo(() => {
    if (!isLinux) return '';
    const mac = inputMAC.trim().toLowerCase();
    if (!machineId && !mac) return '';
    return MD5(machineId + mac).toString();
  }, [isLinux, machineId, inputMAC]);

  // 当前生效的 GUID (基于已保存的 MAC)
  const currentLinuxGUID = useMemo(() => {
    if (!isLinux || !currentMAC) return '';
    return MD5(machineId + currentMAC).toString();
  }, [isLinux, machineId, currentMAC]);

  // 检测平台
  const fetchPlatform = useCallback(async () => {
    try {
      const data = await QQManager.getPlatformInfo();
      setPlatform(data.platform);
    } catch {
      // 如果获取失败，默认 win32 向后兼容
      setPlatform('win32');
    }
  }, []);

  // Windows: 获取 GUID
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

  // Windows: 获取备份
  const fetchBackups = useCallback(async () => {
    try {
      const data = await QQManager.getGUIDBackups();
      setBackups(data);
    } catch {
      // ignore
    }
  }, []);

  // Linux: 获取 MAC + machine-id
  const fetchLinuxInfo = useCallback(async () => {
    setLoading(true);
    try {
      const [macData, midData] = await Promise.all([
        QQManager.getLinuxMAC().catch(() => ({ mac: '' })),
        QQManager.getLinuxMachineId().catch(() => ({ machineId: '' })),
      ]);
      setCurrentMAC(macData.mac);
      setInputMAC(macData.mac);
      setMachineId(midData.machineId);
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`获取设备信息失败: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Linux: 获取备份
  const fetchLinuxBackups = useCallback(async () => {
    try {
      const data = await QQManager.getLinuxMachineInfoBackups();
      setLinuxBackups(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchPlatform();
  }, [fetchPlatform]);

  useEffect(() => {
    if (!platformDetected) return;
    if (isWindows) {
      fetchGUID();
      fetchBackups();
    } else {
      fetchLinuxInfo();
      fetchLinuxBackups();
    }
  }, [platformDetected, isWindows, fetchGUID, fetchBackups, fetchLinuxInfo, fetchLinuxBackups]);

  // ========== Windows 操作 ==========

  const handleCopy = () => {
    const guid = isLinux ? currentLinuxGUID : currentGUID;
    if (guid) {
      navigator.clipboard.writeText(guid);
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

  // ========== Linux 操作 ==========

  const handleLinuxSaveMAC = async () => {
    const mac = inputMAC.trim().toLowerCase();
    if (!isValidMAC(mac)) {
      toast.error('MAC 格式无效，需要 xx-xx-xx-xx-xx-xx 格式');
      return;
    }
    setSaving(true);
    try {
      await QQManager.setLinuxMAC(mac);
      setCurrentMAC(mac);
      toast.success('MAC 已设置，重启后生效');
      await fetchLinuxBackups();
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`设置 MAC 失败: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLinuxCopyMAC = () => {
    if (currentMAC) {
      navigator.clipboard.writeText(currentMAC);
      toast.success('MAC 已复制到剪贴板');
    }
  };

  const handleLinuxDelete = () => {
    dialog.confirm({
      title: '确认删除',
      content: '删除 machine-info 后，QQ 将在下次启动时生成新的设备标识。确定要删除吗？',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          await QQManager.resetLinuxDeviceID();
          setCurrentMAC('');
          setInputMAC('');
          toast.success('已删除，重启后生效');
          await fetchLinuxBackups();
        } catch (error) {
          const msg = (error as Error).message;
          toast.error(`删除失败: ${msg}`);
        }
      },
    });
  };

  const handleLinuxBackup = async () => {
    try {
      await QQManager.createLinuxMachineInfoBackup();
      toast.success('备份已创建');
      await fetchLinuxBackups();
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`备份失败: ${msg}`);
    }
  };

  const handleLinuxRestore = (backupName: string) => {
    dialog.confirm({
      title: '确认恢复',
      content: `确定要从备份 "${backupName}" 恢复吗？当前的 machine-info 将被覆盖。`,
      confirmText: '恢复',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          await QQManager.restoreLinuxMachineInfoBackup(backupName);
          toast.success('已恢复，重启后生效');
          await fetchLinuxInfo();
          await fetchLinuxBackups();
        } catch (error) {
          const msg = (error as Error).message;
          toast.error(`恢复失败: ${msg}`);
        }
      },
    });
  };

  // ========== 重启 ==========

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

  if (loading || !platformDetected) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Spinner label='加载中...' />
      </div>
    );
  }

  // ========== macOS 不支持 ==========
  if (isMac) {
    return (
      <div className={`flex flex-col gap-${compact ? '3' : '4'}`}>
        <div className='flex flex-col items-center justify-center py-8 gap-2'>
          <Chip variant='flat' color='warning' className='text-xs'>
            macOS 平台暂不支持 GUID 管理
          </Chip>
          <div className='text-xs text-default-400'>
            该功能仅适用于 Windows 和 Linux 平台
          </div>
        </div>
      </div>
    );
  }

  // ========== Linux 渲染 ==========
  if (isLinux) {
    return (
      <div className={`flex flex-col gap-${compact ? '3' : '4'}`}>
        {/* 当前设备信息 */}
        <div className='flex flex-col gap-2'>
          <div className='text-sm font-medium text-default-700'>当前设备 GUID</div>
          <div className='flex items-center gap-2'>
            {currentLinuxGUID ? (
              <Chip variant='flat' color='primary' className='font-mono text-xs max-w-full'>
                {currentLinuxGUID}
              </Chip>
            ) : (
              <Chip variant='flat' color='warning' className='text-xs'>
                未设置 / 不存在
              </Chip>
            )}
            {currentLinuxGUID && (
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
              onPress={fetchLinuxInfo}
              aria-label='刷新'
            >
              <MdRefresh size={16} />
            </Button>
          </div>
          <div className='text-xs text-default-400'>
            GUID = MD5(machine-id + MAC)，修改 MAC 即可改变 GUID
          </div>
        </div>

        <Divider />

        {/* machine-id 显示 */}
        <div className='flex flex-col gap-1'>
          <div className='text-sm font-medium text-default-700'>Machine ID</div>
          <Chip variant='flat' color='default' className='font-mono text-xs max-w-full'>
            {machineId || '未知'}
          </Chip>
          <div className='text-xs text-default-400'>
            来自 /etc/machine-id，不可修改
          </div>
        </div>

        <Divider />

        {/* 当前 MAC 显示 */}
        <div className='flex flex-col gap-2'>
          <div className='text-sm font-medium text-default-700'>当前 MAC 地址</div>
          <div className='flex items-center gap-2'>
            {currentMAC ? (
              <Chip variant='flat' color='secondary' className='font-mono text-xs max-w-full'>
                {currentMAC}
              </Chip>
            ) : (
              <Chip variant='flat' color='warning' className='text-xs'>
                未设置 / 不存在
              </Chip>
            )}
            {currentMAC && (
              <Button
                isIconOnly
                size='sm'
                variant='light'
                onPress={handleLinuxCopyMAC}
                aria-label='复制MAC'
              >
                <MdContentCopy size={16} />
              </Button>
            )}
          </div>
        </div>

        <Divider />

        {/* 编辑 MAC 地址 */}
        <div className='flex flex-col gap-2'>
          <div className='text-sm font-medium text-default-700'>设置 MAC 地址</div>
          <div className='flex items-center gap-2'>
            <Input
              size='sm'
              variant='bordered'
              placeholder='xx-xx-xx-xx-xx-xx'
              value={inputMAC}
              onValueChange={setInputMAC}
              isInvalid={inputMAC.length > 0 && !isValidMAC(inputMAC)}
              errorMessage={inputMAC.length > 0 && !isValidMAC(inputMAC) ? '格式: xx-xx-xx-xx-xx-xx' : undefined}
              classNames={{
                input: 'font-mono text-sm',
              }}
              maxLength={17}
            />
          </div>

          {/* 实时 GUID 预览 */}
          {inputMAC && isValidMAC(inputMAC) && (
            <div className='flex flex-col gap-1 p-2 rounded-lg bg-default-100'>
              <div className='text-xs font-medium text-default-500'>预览 GUID</div>
              <div className='font-mono text-xs text-primary break-all'>
                {computedLinuxGUID}
              </div>
              {computedLinuxGUID !== currentLinuxGUID && (
                <div className='text-xs text-warning-500'>
                  与当前 GUID 不同，保存后重启生效
                </div>
              )}
            </div>
          )}

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              color='primary'
              variant='flat'
              isLoading={saving}
              isDisabled={!isValidMAC(inputMAC) || inputMAC.trim().toLowerCase() === currentMAC}
              onPress={handleLinuxSaveMAC}
              startContent={<MdSave size={16} />}
            >
              保存 MAC
            </Button>
            <Button
              size='sm'
              color='danger'
              variant='flat'
              isDisabled={!currentMAC}
              onPress={handleLinuxDelete}
              startContent={<MdDelete size={16} />}
            >
              删除
            </Button>
            <Button
              size='sm'
              color='secondary'
              variant='flat'
              isDisabled={!currentMAC}
              onPress={handleLinuxBackup}
              startContent={<MdBackup size={16} />}
            >
              手动备份
            </Button>
          </div>
          <div className='text-xs text-default-400'>
            修改 MAC 后 GUID 将变化，需重启 NapCat 才能生效，操作前会自动备份
          </div>
        </div>

        {/* 备份恢复 */}
        {linuxBackups.length > 0 && (
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
                  onAction={(key) => handleLinuxRestore(key as string)}
                >
                  {linuxBackups.map((name) => (
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
  }

  // ========== Windows 渲染 ==========
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
