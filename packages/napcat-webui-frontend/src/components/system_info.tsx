import { Card, CardBody, CardHeader } from '@heroui/card';

import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import { Tooltip } from '@heroui/tooltip';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { Pagination } from '@heroui/pagination';
import { Tabs, Tab } from '@heroui/tabs';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { useLocalStorage, useDebounce } from '@uidotdev/usehooks';
import { useRequest } from 'ahooks';
import clsx from 'clsx';
import { FaCircleInfo, FaQq } from 'react-icons/fa6';
import { IoLogoChrome, IoLogoOctocat, IoSearch } from 'react-icons/io5';
import { IoMdFlash, IoMdCheckmark, IoMdSettings } from 'react-icons/io';
import { RiMacFill } from 'react-icons/ri';
import { useState, useCallback } from 'react';

import key from '@/const/key';
import WebUIManager from '@/controllers/webui_manager';
import MirrorManager from '@/controllers/mirror_manager';
import useDialog from '@/hooks/use-dialog';
import Modal from '@/components/modal';
import MirrorSelectorModal from '@/components/mirror_selector_modal';
import { hasNewVersion, compareVersion } from '@/utils/version';


export interface SystemInfoItemProps {
  title: string;
  icon?: React.ReactNode;
  value?: React.ReactNode;
  endContent?: React.ReactNode;
  hasBackground?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}

const SystemInfoItem: React.FC<SystemInfoItemProps> = ({
  title,
  value = '--',
  icon,
  endContent,
  hasBackground = false,
  onClick,
  clickable = false,
}) => {
  return (
    <div
      className={clsx(
        'flex text-sm gap-3 py-2 items-baseline transition-colors',
        hasBackground
          ? 'text-white/90'
          : 'text-default-600 dark:text-gray-300',
        clickable && 'cursor-pointer hover:bg-default-100/50 dark:hover:bg-default-800/30 rounded-lg -mx-2 px-2'
      )}
      onClick={onClick}
    >
      <div className="text-lg opacity-70 self-center">{icon}</div>
      <div className='w-24 font-medium'>{title}</div>
      <div className={clsx(
        'text-xs font-mono flex-1',
        hasBackground ? 'text-white/80' : 'text-default-500'
      )}>{value}</div>
      <div className="self-center">{endContent}</div>
    </div>
  );
};

export interface NewVersionTipProps {
  currentVersion?: string;
}

// 更新状态类型
type UpdateStatus = 'idle' | 'updating' | 'success' | 'error';

// 更新对话框内容组件
const UpdateDialogContent: React.FC<{
  currentVersion: string;
  latestVersion: string;
  status: UpdateStatus;
  errorMessage?: string;
}> = ({ currentVersion, latestVersion, status, errorMessage }) => {
  return (
    <div className='space-y-6'>
      {/* 版本对比 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-8 bg-default-50 dark:bg-default-100/5 rounded-xl border border-default-100 dark:border-default-100/10">
        <div className="flex flex-col items-center gap-2 min-w-0 w-full sm:w-auto">
          <span className="text-xs text-default-500 font-medium uppercase tracking-wider">当前版本</span>
          <Tooltip content={`v${currentVersion}`}>
            <Chip size="md" variant="flat" color="default" classNames={{ content: "font-mono font-bold text-sm truncate max-w-[120px] sm:max-w-[160px]" }}>
              v{currentVersion}
            </Chip>
          </Tooltip>
        </div>

        <div className="flex flex-col items-center text-primary-500 px-4 shrink-0">
          <div className="p-2 rounded-full bg-primary-50 dark:bg-primary-900/20">
            <svg className="w-6 h-6 animate-pulse rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 min-w-0 w-full sm:w-auto">
          <span className="text-xs text-primary-500 font-medium uppercase tracking-wider">最新版本</span>
          <Tooltip content={`v${latestVersion}`}>
            <Chip size="md" color="primary" variant="shadow" classNames={{ content: "font-mono font-bold text-sm truncate max-w-[120px] sm:max-w-[160px]" }}>
              v{latestVersion}
            </Chip>
          </Tooltip>
        </div>
      </div>

      {/* 更新状态显示 */}
      {status === 'updating' && (
        <div className='flex flex-col items-center justify-center gap-3 py-4 px-4 rounded-lg bg-primary-50/50 dark:bg-primary-900/20 border border-primary-200/50 dark:border-primary-700/30'>
          <Spinner size='md' color='primary' />
          <div className='text-center'>
            <p className='text-sm font-medium text-primary-600 dark:text-primary-400'>
              正在更新中...
            </p>
            <p className='text-xs text-default-500 mt-1'>
              请耐心等待，更新可能需要几分钟
            </p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className='flex flex-col items-center justify-center gap-3 py-4 px-4 rounded-lg bg-success-50/50 dark:bg-success-900/20 border border-success-200/50 dark:border-success-700/30'>
          <div className='w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/40 flex items-center justify-center'>
            <svg className='w-6 h-6 text-success-600 dark:text-success-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <div className='text-center'>
            <p className='text-sm font-medium text-success-600 dark:text-success-400'>
              更新完成
            </p>
            <p className='text-xs text-default-500 mt-1'>
              请重启 NapCat 以应用新版本
            </p>
          </div>
          <div className='mt-2 p-3 rounded-lg bg-warning-50/50 dark:bg-warning-900/20 border border-warning-200/50 dark:border-warning-700/30'>
            <p className='text-xs text-warning-700 dark:text-warning-400 flex items-center gap-1 justify-center'>
              <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
              </svg>
              <span>重启 NapCat 生效</span>
            </p>
          </div>
          <div className='flex gap-3 justify-center mt-2 w-full'>
            <button
              className='px-4 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-white shadow-sm transition-colors shadow-primary-500/20 w-full'
              onClick={() => WebUIManager.restart()}
            >
              立即重启
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className='flex flex-col items-center justify-center gap-3 py-4 px-4 rounded-lg bg-danger-50/50 dark:bg-danger-900/20 border border-danger-200/50 dark:border-danger-700/30'>
          <div className='w-12 h-12 rounded-full bg-danger-100 dark:bg-danger-900/40 flex items-center justify-center'>
            <svg className='w-6 h-6 text-danger-600 dark:text-danger-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </div>
          <div className='text-center'>
            <p className='text-sm font-medium text-danger-600 dark:text-danger-400'>
              更新失败
            </p>
            <p className='text-xs text-default-500 mt-1'>
              {errorMessage || '请稍后重试或手动更新'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const NewVersionTip = (props: NewVersionTipProps) => {
  const { currentVersion } = props;
  const dialog = useDialog();
  const { data: latestVersion, error } = useRequest(WebUIManager.getLatestTag, {
    cacheKey: 'napcat-latest-tag',
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');

  // 使用 SemVer 规范比较版本号
  if (error || !latestVersion || !currentVersion || !hasNewVersion(currentVersion, latestVersion)) {
    return null;
  }

  const handleUpdate = async () => {
    setUpdateStatus('updating');

    try {
      await WebUIManager.UpdateNapCat();
      setUpdateStatus('success');
      // 显示更新成功对话框
      dialog.alert({
        title: '更新完成',
        content: (
          <UpdateDialogContent
            currentVersion={currentVersion}
            latestVersion={latestVersion}
            status='success'
          />
        ),
        confirmText: '我知道了',
        size: 'md',
      });
    } catch (err) {
      console.error('Update failed:', err);
      const errMessage = err instanceof Error ? err.message : '未知错误';
      setUpdateStatus('error');
      // 显示更新失败对话框
      dialog.alert({
        title: '更新失败',
        content: (
          <UpdateDialogContent
            currentVersion={currentVersion}
            latestVersion={latestVersion}
            status='error'
            errorMessage={errMessage}
          />
        ),
        confirmText: '确定',
        size: 'md',
      });
    }
  };

  const showUpdateDialog = () => {
    dialog.confirm({
      title: '发现新版本',
      content: (
        <UpdateDialogContent
          currentVersion={currentVersion}
          latestVersion={latestVersion}
          status='idle'
        />
      ),
      confirmText: '立即更新',
      cancelText: '稍后更新',
      size: 'md',
      onConfirm: handleUpdate,
    });
  };

  return (
    <Tooltip content='有新版本可用'>
      <div className="cursor-pointer flex items-center justify-center" onClick={updateStatus === 'updating' ? undefined : showUpdateDialog}>
        <Chip
          size="sm"
          color="danger"
          variant="flat"
          classNames={{
            content: "font-bold text-[10px] px-1 flex items-center justify-center",
            base: "h-5 min-h-5 min-w-[42px]"
          }}
        >
          {updateStatus === 'updating' ? <Spinner size="sm" color="danger" classNames={{ wrapper: "w-3 h-3" }} /> : 'New'}
        </Chip>
      </div>
    </Tooltip>
  );
};

// 版本信息类型
interface VersionInfo {
  tag: string;
  type: 'release' | 'prerelease' | 'action';
  artifactId?: number;
  artifactName?: string;
  createdAt?: string;
  expiresAt?: string;
  size?: number;
  workflowRunId?: number;
  headSha?: string;
  workflowTitle?: string;
}

// 版本选择对话框内容
interface VersionSelectDialogProps {
  currentVersion: string;
  onClose: () => void;
}

const VersionSelectDialogContent: React.FC<VersionSelectDialogProps> = ({
  currentVersion,
  onClose,
}) => {
  const dialog = useDialog();
  const [selectedVersion, setSelectedVersion] = useState<VersionInfo | null>(null);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'release' | 'action'>('release');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 镜像相关状态
  const [selectedMirror, setSelectedMirror] = useState<string | undefined>(undefined);
  const [mirrorLatency, setMirrorLatency] = useState<number | null>(null);
  const [mirrorTesting, setMirrorTesting] = useState(false);
  const [mirrorModalOpen, setMirrorModalOpen] = useState(false);

  // 测试当前镜像速度
  const testCurrentMirror = async () => {
    setMirrorTesting(true);
    try {
      const result = await MirrorManager.testSingleMirror(selectedMirror || '', 'file');
      if (result.success) {
        setMirrorLatency(result.latency);
      } else {
        setMirrorLatency(null);
      }
    } catch (e) {
      setMirrorLatency(null);
    } finally {
      setMirrorTesting(false);
    }
  };

  const formatLatency = (latency: number) => {
    if (latency >= 5000) return '>5s';
    if (latency >= 1000) return `${(latency / 1000).toFixed(1)}s`;
    return `${latency}ms`;
  };

  const getLatencyColor = (latency: number | null): 'success' | 'warning' | 'danger' | 'default' => {
    if (latency === null) return 'default';
    if (latency < 300) return 'success';
    if (latency < 1000) return 'warning';
    return 'danger';
  };

  const getMirrorDisplayName = () => {
    if (!selectedMirror) return '自动选择';
    try {
      return new URL(selectedMirror).hostname;
    } catch {
      return selectedMirror;
    }
  };

  // 获取所有可用版本（带分页、过滤和搜索）
  // 懒加载：根据 activeTab 只获取对应类型的版本
  const pageSize = 15;
  const { data: releasesData, loading: releasesLoading, error: releasesError } = useRequest(
    () => WebUIManager.getAllReleases({
      page: currentPage,
      pageSize,
      type: activeTab,
      search: debouncedSearch,
      mirror: selectedMirror
    }),
    {
      refreshDeps: [currentPage, activeTab, debouncedSearch, selectedMirror],
    }
  );

  // 版本列表已在后端过滤，直接使用
  const filteredVersions = (releasesData?.versions || []) as VersionInfo[];

  // 检查是否是降级（使用语义化版本比较）
  const isDowngrade = useCallback((targetTag: string): boolean => {
    if (!currentVersion || !targetTag) return false;
    // Action 版本不算降级
    if (targetTag.startsWith('action-')) return false;
    return compareVersion(targetTag, currentVersion) < 0;
  }, [currentVersion]);

  const selectedVersionTag = selectedVersion?.tag || '';
  const isSelectedDowngrade = isDowngrade(selectedVersionTag);

  const performUpdate = async (force: boolean) => {
    if (!selectedVersion) return;
    setUpdateStatus('updating');
    setErrorMessage('');

    try {
      await WebUIManager.UpdateNapCatToVersion(selectedVersionTag, force, selectedMirror);
      setUpdateStatus('success');
    } catch (err) {
      console.error('Update failed:', err);
      const errMsg = err instanceof Error ? err.message : '未知错误';
      setErrorMessage(errMsg);
      setUpdateStatus('error');
    }
  };

  const handleUpdate = async () => {
    if (!selectedVersion) return;

    if (isSelectedDowngrade && !forceUpdate) {
      dialog.confirm({
        title: '确认降级',
        content: (
          <div className='space-y-2'>
            <p className='text-warning-600'>
              您正在尝试从 <strong>v{currentVersion}</strong> 降级到 <strong>{selectedVersionTag}</strong>
            </p>
            <p className='text-sm text-default-500'>
              降级可能导致配置不兼容或功能丢失，请确认您了解相关风险。
            </p>
          </div>
        ),
        confirmText: '确认降级',
        cancelText: '取消',
        onConfirm: () => performUpdate(true),
      });
      return;
    }

    await performUpdate(forceUpdate);
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (updateStatus === 'success') {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-4'>
        <div className='w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/40 flex items-center justify-center'>
          <svg className='w-6 h-6 text-success-600 dark:text-success-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>
        <div className='text-center w-full'>
          <p className='text-sm font-medium text-success-600 dark:text-success-400'>
            更新到 {selectedVersionTag} 完成
          </p>
          <p className='text-xs text-default-500 mt-1 mb-6'>
            请重启 NapCat 以应用新版本
          </p>
          <div className='flex gap-3 justify-center'>
            <button
              className='px-4 py-2 text-sm rounded-lg bg-default-100 hover:bg-default-200 transition-colors text-default-700'
              onClick={onClose}
            >
              稍后重启
            </button>
            <button
              className='px-4 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-white shadow-sm transition-colors shadow-primary-500/20'
              onClick={async () => {
                await WebUIManager.restart();
                onClose();
              }}
            >
              立即重启
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (updateStatus === 'error') {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-4'>
        <div className='w-12 h-12 rounded-full bg-danger-100 dark:bg-danger-900/40 flex items-center justify-center'>
          <svg className='w-6 h-6 text-danger-600 dark:text-danger-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </div>
        <div className='text-center'>
          <p className='text-sm font-medium text-danger-600 dark:text-danger-400'>
            更新失败
          </p>
          <p className='text-xs text-default-500 mt-1'>
            {errorMessage || '请稍后重试'}
          </p>
        </div>
      </div>
    );
  }

  if (updateStatus === 'updating') {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-6'>
        <Spinner size='lg' color='primary' />
        <div className='text-center'>
          <p className='text-sm font-medium text-primary-600 dark:text-primary-400'>
            正在更新到 {selectedVersionTag}...
          </p>
          <p className='text-xs text-default-500 mt-1'>
            请耐心等待，更新可能需要几分钟
          </p>
        </div>
      </div>
    );
  }

  const pagination = releasesData?.pagination;

  return (
    <div className='space-y-4'>
      {/* 当前版本 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-default-600'>当前版本:</span>
          <Chip color='primary' variant='flat' size='sm'>
            v{currentVersion}
          </Chip>
        </div>
        {releasesData?.mirror && (
          <div className='text-xs text-default-400 flex items-center gap-1'>
            <span className='w-2 h-2 rounded-full bg-success-500'></span>
            镜像: {releasesData.mirror}
          </div>
        )}
      </div>

      {/* 版本类型切换 */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => {
          setActiveTab(key as 'release' | 'action');
          setCurrentPage(1);
          setSelectedVersion(null);
          setSearchQuery('');
        }}
        size='sm'
        color='primary'
        variant='underlined'
        classNames={{
          tabList: 'gap-4',
        }}
      >
        <Tab key='release' title='正式版本' />
        <Tab key='action' title='临时版本 (Action)' />
      </Tabs>

      {/* 下载镜像状态卡片 */}
      <Card className="bg-default-100/50 shadow-sm">
        <CardBody className="py-2 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-default-500">镜像源:</span>
              <span className="text-sm font-medium">{getMirrorDisplayName()}</span>
              {mirrorLatency !== null && (
                <Chip
                  size="sm"
                  color={getLatencyColor(mirrorLatency)}
                  variant="flat"
                  startContent={<IoMdCheckmark size={12} />}
                >
                  {formatLatency(mirrorLatency)}
                </Chip>
              )}
              {mirrorLatency === null && !mirrorTesting && (
                <Chip size="sm" color="default" variant="flat">
                  未测试
                </Chip>
              )}
              {mirrorTesting && (
                <Chip size="sm" color="primary" variant="flat">
                  测速中...
                </Chip>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="测速">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={testCurrentMirror}
                  isLoading={mirrorTesting}
                >
                  <IoMdFlash size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="切换镜像">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setMirrorModalOpen(true)}
                >
                  <IoMdSettings size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 搜索框 */}
      <Input
        placeholder='搜索版本号...'
        size='sm'
        value={searchQuery}
        onValueChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
          setSelectedVersion(null);
        }}
        startContent={<IoSearch className='text-default-400' />}
        isClearable
        onClear={() => setSearchQuery('')}
        classNames={{
          inputWrapper: 'h-9',
        }}
      />

      {/* 版本选择 */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <label className='text-sm font-medium text-default-700'>选择目标版本</label>
          {releasesData?.pagination && (
            <span className='text-xs text-default-400'>
              共 {releasesData.pagination.total} 个版本
            </span>
          )}
        </div>
        {releasesLoading ? (
          <div className='flex items-center gap-2 py-2'>
            <Spinner size='sm' />
            <span className='text-sm text-default-500'>加载版本列表...</span>
          </div>
        ) : releasesError ? (
          <div className='text-sm text-danger-500'>
            加载版本列表失败: {releasesError.message}
          </div>
        ) : filteredVersions.length === 0 ? (
          <div className='text-sm text-default-500 py-4 text-center'>
            {searchQuery ? `未找到匹配 "${searchQuery}" 的版本` : '暂无可用版本'}
          </div>
        ) : (
          <Select
            label='选择版本'
            placeholder='请选择要更新的版本'
            selectedKeys={selectedVersion ? [selectedVersionTag] : []}
            onSelectionChange={(keys) => {
              const selectedTag = Array.from(keys)[0] as string;
              const version = filteredVersions.find(v => v.tag === selectedTag);
              setSelectedVersion(version || null);
            }}
            classNames={{
              trigger: 'h-auto min-h-10',
            }}
          >
            {filteredVersions.map((version) => {
              const isCurrent = version.tag.replace(/^v/, '') === currentVersion;
              const downgrade = isDowngrade(version.tag);
              return (
                <SelectItem
                  key={version.tag}
                  textValue={version.tag}
                >
                  <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-2'>
                      <span className="truncate max-w-[300px]">
                        {version.type === 'action'
                          ? (version.workflowTitle || version.artifactName || version.tag)
                          : version.tag
                        }
                      </span>
                      {version.type === 'prerelease' && (
                        <Chip size='sm' color='secondary' variant='flat'>预发布</Chip>
                      )}
                      {version.type === 'action' && (
                        <Chip size='sm' color='default' variant='flat'>临时</Chip>
                      )}
                      {isCurrent && (
                        <Chip size='sm' color='success' variant='flat'>当前</Chip>
                      )}
                      {downgrade && !isCurrent && version.type !== 'action' && (
                        <Chip size='sm' color='warning' variant='flat'>降级</Chip>
                      )}
                    </div>
                    {version.type === 'action' && (
                      <div className='text-xs text-default-400 flex items-center gap-2'>
                        <span className='font-mono bg-default-100 dark:bg-default-100/10 px-1 rounded'>{version.tag}</span>
                        {version.headSha && <span className='font-mono' title={version.headSha}>{version.headSha.slice(0, 7)}</span>}
                        {version.createdAt && <span>{new Date(version.createdAt).toLocaleString()}</span>}
                        {version.size && <span>{(version.size / 1024 / 1024).toFixed(1)} MB</span>}
                      </div>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </Select>
        )}
      </div>

      {/* Action 版本提示 */}
      {activeTab === 'action' && (
        <div className='p-3 rounded-lg bg-default-50 dark:bg-default-100/10 border border-default-200/50'>
          <p className='text-xs text-default-500'>
            临时版本来自 GitHub Actions 构建，可能不稳定，适合测试新功能。
            {selectedVersion?.expiresAt && (
              <span className='block mt-1 text-warning-600'>
                此版本将于 {new Date(selectedVersion.expiresAt).toLocaleDateString()} 过期
              </span>
            )}
          </p>

        </div>
      )}

      {/* 降级警告 */}
      {selectedVersion && isSelectedDowngrade && (
        <div className='p-3 rounded-lg bg-warning-50/50 dark:bg-warning-900/20 border border-warning-200/50 dark:border-warning-700/30'>
          <div className='flex items-start gap-2'>
            <svg className='w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
            </svg>
            <div>
              <p className='text-sm font-medium text-warning-700 dark:text-warning-400'>
                版本降级警告
              </p>
              <p className='text-xs text-warning-600/80 dark:text-warning-500 mt-1'>
                降级到旧版本可能导致配置不兼容或功能丢失
              </p>
            </div>
          </div>
          <div className='mt-3 flex items-center gap-2'>
            <Switch
              size='sm'
              isSelected={forceUpdate}
              onValueChange={setForceUpdate}
            />
            <span className='text-xs text-warning-700 dark:text-warning-400'>
              我了解风险，确认降级
            </span>
          </div>
        </div>
      )}

      {/* 分页 */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-center'>
          <Pagination
            total={pagination.totalPages}
            page={currentPage}
            onChange={handlePageChange}
            size='sm'
            showControls
          />
        </div>
      )}

      {/* 操作按钮 */}
      <div className='flex justify-end gap-2 pt-4 border-t border-default-100 dark:border-default-100/10'>
        <button
          className='px-4 py-2 text-sm rounded-lg bg-default-100 hover:bg-default-200 transition-colors'
          onClick={onClose}
        >
          关闭
        </button>
        <button
          className={clsx(
            'px-4 py-2 text-sm rounded-lg transition-colors text-white shadow-sm',
            selectedVersion && (!isSelectedDowngrade || forceUpdate)
              ? 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20'
              : 'bg-default-300 cursor-not-allowed'
          )}
          disabled={!selectedVersion || (isSelectedDowngrade && !forceUpdate)}
          onClick={handleUpdate}
        >
          {isSelectedDowngrade ? '确认降级更新' : '更新到此版本'}
        </button>
      </div>

      {/* 镜像选择弹窗 */}
      <MirrorSelectorModal
        isOpen={mirrorModalOpen}
        onClose={() => setMirrorModalOpen(false)}
        currentMirror={selectedMirror}
        onSelect={(mirror) => {
          setSelectedMirror(mirror || undefined);
          setMirrorLatency(null);
        }}
        type="file"
      />
    </div>
  );
};

interface NapCatVersionProps {
  hasBackground?: boolean;
}

const NapCatVersion: React.FC<NapCatVersionProps> = ({ hasBackground = false }) => {
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const {
    data: packageData,
    loading: packageLoading,
    error: packageError,
  } = useRequest(WebUIManager.GetNapCatVersion, {
    cacheKey: 'napcat-version',
    staleTime: 60 * 60 * 1000,
    cacheTime: 24 * 60 * 60 * 1000,
  });

  const currentVersion = packageData?.version;

  // 点击版本号时显示版本选择对话框
  const handleVersionClick = useCallback(() => {
    if (!currentVersion) return;
    setIsVersionModalOpen(true);
  }, [currentVersion]);

  return (
    <>
      <SystemInfoItem
        title='NapCat 版本'
        icon={<IoLogoOctocat className='text-xl' />}
        hasBackground={hasBackground}
        value={
          packageError
            ? (
              `错误：${packageError.message}`
            )
            : packageLoading
              ? (
                <Spinner size='sm' />
              )
              : (
                <Tooltip content='点击管理版本'>
                  <span
                    className='cursor-pointer hover:text-primary-500 transition-colors underline decoration-dashed underline-offset-2'
                    onClick={handleVersionClick}
                  >
                    {currentVersion}
                  </span>
                </Tooltip>
              )
        }
        endContent={<NewVersionTip currentVersion={currentVersion} />}
      />
      {isVersionModalOpen && (
        <Modal
          title='版本管理'
          size='lg'
          hideFooter={true}
          onClose={() => setIsVersionModalOpen(false)}
          content={
            <VersionSelectDialogContent
              currentVersion={currentVersion || ''}
              onClose={() => setIsVersionModalOpen(false)}
            />
          }
        />
      )}
    </>
  );
};

export interface SystemInfoProps {
  archInfo?: string;
}
const SystemInfo: React.FC<SystemInfoProps> = (props) => {
  const { archInfo } = props;
  const {
    data: qqVersionData,
    loading: qqVersionLoading,
    error: qqVersionError,
  } = useRequest(WebUIManager.getQQVersion, {
    cacheKey: 'qq-version',
    staleTime: 60 * 60 * 1000,
    cacheTime: 24 * 60 * 60 * 1000,
  });
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  return (
    <Card className={clsx(
      'backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-sm overflow-visible flex-1',
      hasBackground ? 'bg-white/10 dark:bg-black/10' : 'bg-white/60 dark:bg-black/40'
    )}>
      <CardHeader className={clsx(
        'pb-0 items-center gap-2 font-bold px-4 pt-4',
        hasBackground ? 'text-white drop-shadow-sm' : 'text-default-700 dark:text-white'
      )}>
        <FaCircleInfo className='text-lg opacity-80' />
        <span>系统信息</span>
      </CardHeader>
      <CardBody className='flex-1'>
        <div className='flex flex-col gap-2 justify-between h-full'>
          <NapCatVersion hasBackground={hasBackground} />
          <SystemInfoItem
            title='QQ 版本'
            icon={<FaQq className='text-lg' />}
            hasBackground={hasBackground}
            value={
              qqVersionError
                ? (
                  `错误：${qqVersionError.message}`
                )
                : qqVersionLoading
                  ? (
                    <Spinner size='sm' />
                  )
                  : (
                    qqVersionData
                  )
            }
          />
          <SystemInfoItem
            title='WebUI 版本'
            icon={<IoLogoChrome className='text-xl' />}
            value='Next'
            hasBackground={hasBackground}
          />
          <SystemInfoItem
            title='系统版本'
            icon={<RiMacFill className='text-xl' />}
            value={archInfo}
            hasBackground={hasBackground}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default SystemInfo;
