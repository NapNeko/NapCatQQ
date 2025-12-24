import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import { Tooltip } from '@heroui/tooltip';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useRequest } from 'ahooks';
import clsx from 'clsx';
import { FaCircleInfo, FaInfo, FaQq } from 'react-icons/fa6';
import { IoLogoChrome, IoLogoOctocat } from 'react-icons/io';
import { RiMacFill } from 'react-icons/ri';
import { useState } from 'react';

import key from '@/const/key';
import WebUIManager from '@/controllers/webui_manager';
import useDialog from '@/hooks/use-dialog';


export interface SystemInfoItemProps {
  title: string;
  icon?: React.ReactNode;
  value?: React.ReactNode;
  endContent?: React.ReactNode;
  hasBackground?: boolean;
}

const SystemInfoItem: React.FC<SystemInfoItemProps> = ({
  title,
  value = '--',
  icon,
  endContent,
  hasBackground = false,
}) => {
  return (
    <div className={clsx(
      'flex text-sm gap-3 py-2 items-center transition-colors',
      hasBackground
        ? 'text-white/90'
        : 'text-default-600 dark:text-gray-300'
    )}>
      <div className="text-lg opacity-70">{icon}</div>
      <div className='w-24 font-medium'>{title}</div>
      <div className={clsx(
        'text-xs font-mono flex-1',
        hasBackground ? 'text-white/80' : 'text-default-500'
      )}>{value}</div>
      <div>{endContent}</div>
    </div>
  );
};

export interface NewVersionTipProps {
  currentVersion?: string;
}

// const NewVersionTip = (props: NewVersionTipProps) => {
//   const { currentVersion } = props;
//   const dialog = useDialog();
//   const { data: releaseData, error } = useRequest(() =>
//     request.get<GithubRelease[]>(
//       'https://api.github.com/repos/NapNeko/NapCatQQ/releases'
//     )
//   );

//   if (error) {
//     return (
//       <Tooltip content='检查新版本失败'>
//         <Button
//           isIconOnly
//           radius='full'
//           color='primary'
//           variant='shadow'
//           className='!w-5 !h-5 !min-w-0 text-small shadow-md'
//           onPress={() => {
//             dialog.alert({
//               title: '检查新版本失败',
//               content: error.message,
//             });
//           }}
//         >
//           <FaInfo />
//         </Button>
//       </Tooltip>
//     );
//   }

//   const latestVersion = releaseData?.data?.[0]?.tag_name;

//   if (!latestVersion || !currentVersion) {
//     return null;
//   }

//   if (compareVersion(latestVersion, currentVersion) <= 0) {
//     return null;
//   }

//   const middleVersions: GithubRelease[] = [];

//   for (let i = 0; i < releaseData.data.length; i++) {
//     const versionInfo = releaseData.data[i];
//     if (compareVersion(versionInfo.tag_name, currentVersion) > 0) {
//       middleVersions.push(versionInfo);
//     } else {
//       break;
//     }
//   }

//   const AISummaryComponent = () => {
//     const {
//       data: aiSummaryData,
//       loading: aiSummaryLoading,
//       error: aiSummaryError,
//       run: runAiSummary,
//     } = useRequest(
//       (version) =>
//         request.get<ServerResponse<string | null>>(
//           `https://release.nc.152710.xyz/?version=${version}`,
//           {
//             timeout: 30000,
//           }
//         ),
//       {
//         manual: true,
//       }
//     );

//     useEffect(() => {
//       runAiSummary(currentVersion);
//     }, [currentVersion, runAiSummary]);

//     if (aiSummaryLoading) {
//       return (
//         <div className='flex justify-center py-1'>
//           <Spinner size='sm' />
//         </div>
//       );
//     }
//     if (aiSummaryError) {
//       return <div className='text-center text-primary-500'>AI 摘要获取失败</div>;
//     }
//     return <span className='text-default-700'>{aiSummaryData?.data.data}</span>;
//   };

//   return (
//     <Tooltip content='有新版本可用'>
//       <Button
//         isIconOnly
//         radius='full'
//         color='primary'
//         variant='shadow'
//         className='!w-5 !h-5 !min-w-0 text-small shadow-md'
//         onPress={() => {
//           dialog.confirm({
//             title: '有新版本可用',
//             content: (
//               <div className='space-y-2'>
//                 <div className='text-sm space-x-2'>
//                   <span>当前版本</span>
//                   <Chip color='primary' variant='flat'>
//                     v{currentVersion}
//                   </Chip>
//                 </div>
//                 <div className='text-sm space-x-2'>
//                   <span>最新版本</span>
//                   <Chip color='primary'>{latestVersion}</Chip>
//                 </div>
//                 <div className='p-2 rounded-md bg-content2 text-sm'>
//                   <div className='text-primary-400 font-bold flex items-center gap-1 mb-1'>
//                     <BsStars />
//                     <span>AI总结</span>
//                   </div>
//                   <AISummaryComponent />
//                 </div>
//                 <div className='text-sm space-y-2 !mt-4'>
//                   {middleVersions.map((versionInfo) => (
//                     <div
//                       key={versionInfo.tag_name}
//                       className='p-4 bg-content1 rounded-md shadow-small'
//                     >
//                       <TailwindMarkdown content={versionInfo.body} />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ),
//             scrollBehavior: 'inside',
//             size: '3xl',
//             confirmText: '前往下载',
//             onConfirm () {
//               window.open(
//                 'https://github.com/NapNeko/NapCatQQ/releases',
//                 '_blank',
//                 'noopener'
//               );
//             },
//           });
//         }}
//       >
//         <FaInfo />
//       </Button>
//     </Tooltip>
//   );
// };

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
    <div className='space-y-4'>
      {/* 版本信息 */}
      <div className='space-y-2'>
        <div className='text-sm space-x-2'>
          <span>当前版本</span>
          <Chip color='primary' variant='flat'>
            v{currentVersion}
          </Chip>
        </div>
        <div className='text-sm space-x-2'>
          <span>最新版本</span>
          <Chip color='primary'>v{latestVersion}</Chip>
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
            <p className='text-xs text-warning-700 dark:text-warning-400 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
              </svg>
              <span>请手动重启 NapCat，更新才会生效</span>
            </p>
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

  if (error || !latestVersion || !currentVersion || latestVersion === currentVersion) {
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
      <Button
        isIconOnly
        radius='full'
        className='!w-5 !h-5 !min-w-0 text-[10px] shadow-lg shadow-pink-500/40 bg-gradient-to-tr from-[#D33FF0] to-[#FF709F] text-white'
        isLoading={updateStatus === 'updating'}
        onPress={showUpdateDialog}
      >
        <FaInfo />
      </Button>
    </Tooltip>
  );
};

interface NapCatVersionProps {
  hasBackground?: boolean;
}

const NapCatVersion: React.FC<NapCatVersionProps> = ({ hasBackground = false }) => {
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

  return (
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
              currentVersion
            )
      }
      endContent={<NewVersionTip currentVersion={currentVersion} />}
    />
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
