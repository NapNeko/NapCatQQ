import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip';
import { IoMdFlash, IoMdCheckmark, IoMdClose } from 'react-icons/io';
import clsx from 'clsx';

import MirrorManager, { MirrorTestResult } from '@/controllers/mirror_manager';

interface MirrorSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mirror: string | undefined) => void;
  currentMirror?: string;
  type?: 'file' | 'raw';
}

export default function MirrorSelectorModal ({
  isOpen,
  onClose,
  onSelect,
  currentMirror,
  type = 'file',
}: MirrorSelectorModalProps) {
  const [mirrors, setMirrors] = useState<string[]>([]);
  const [selectedMirror, setSelectedMirror] = useState<string>(currentMirror || 'auto');
  const [testResults, setTestResults] = useState<Map<string, MirrorTestResult>>(new Map());
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testMessage, setTestMessage] = useState('');
  const [fastestMirror, setFastestMirror] = useState<string | null>(null);

  // 加载镜像列表
  useEffect(() => {
    if (isOpen) {
      loadMirrors();
    }
  }, [isOpen]);

  const loadMirrors = async () => {
    try {
      const data = await MirrorManager.getMirrorList();
      const mirrorList = type === 'raw' ? data.rawMirrors : data.fileMirrors;
      setMirrors(mirrorList);
      if (data.customMirror) {
        setSelectedMirror(data.customMirror);
      }
    } catch (e) {
      console.error('Failed to load mirrors:', e);
    }
  };

  const startSpeedTest = () => {
    setIsTesting(true);
    setTestProgress(0);
    setTestResults(new Map());
    setFastestMirror(null);
    setTestMessage('准备测速...');

    MirrorManager.testMirrorsSSE(type, {
      onStart: (data) => {
        setTestMessage(data.message);
      },
      onTesting: (data) => {
        setTestProgress((data.index / data.total) * 100);
        setTestMessage(data.message);
      },
      onResult: (data) => {
        setTestResults((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.result.mirror, data.result);
          return newMap;
        });
        setTestProgress(((data.index + 1) / data.total) * 100);
      },
      onComplete: (data) => {
        setIsTesting(false);
        setTestProgress(100);
        setTestMessage(data.message);
        if (data.fastest) {
          setFastestMirror(data.fastest.mirror);
        }
      },
      onError: (error) => {
        setIsTesting(false);
        setTestMessage(`测速失败: ${error}`);
      },
    });
  };

  const handleConfirm = () => {
    const mirror = selectedMirror === 'auto' ? undefined : selectedMirror;
    onSelect(mirror);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl" 
      scrollBehavior="inside"
      classNames={{
        backdrop: 'z-[200]',
        wrapper: 'z-[200]',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between pr-8">
            <span>选择镜像源</span>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={!isTesting && <IoMdFlash />}
              onPress={startSpeedTest}
              isLoading={isTesting}
            >
              {isTesting ? '测速中...' : '一键测速'}
            </Button>
          </div>
          {isTesting && (
            <div className="mt-2">
              <div className="w-full bg-default-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                />
              </div>
              <p className="text-xs text-default-500 mt-1">{testMessage}</p>
            </div>
          )}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2">
            {/* 自动选择选项 */}
            <MirrorOption
              value="auto"
              label="自动选择"
              description="系统自动选择最快的镜像源"
              isSelected={selectedMirror === 'auto'}
              onSelect={() => setSelectedMirror('auto')}
              badge={<Chip size="sm" color="primary" variant="flat">推荐</Chip>}
            />

            {/* 原始 GitHub */}
            <MirrorOption
              value="https://github.com"
              label="GitHub 原始"
              description="直连 GitHub（可能较慢）"
              isSelected={selectedMirror === 'https://github.com'}
              onSelect={() => setSelectedMirror('https://github.com')}
              testResult={testResults.get('https://github.com (原始)')}
              isFastest={fastestMirror === 'https://github.com (原始)'}
            />

            {/* 镜像列表 */}
            {mirrors.map((mirror) => {
              if (!mirror) return null;
              const result = testResults.get(mirror);
              const isFastest = fastestMirror === mirror;

              let hostname = mirror;
              try {
                hostname = new URL(mirror).hostname;
              } catch { }

              return (
                <MirrorOption
                  key={mirror}
                  value={mirror}
                  label={hostname}
                  description={mirror}
                  isSelected={selectedMirror === mirror}
                  onSelect={() => setSelectedMirror(mirror)}
                  testResult={result}
                  isFastest={isFastest}
                />
              );
            })}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleConfirm}>
            确认选择
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// 镜像选项组件
interface MirrorOptionProps {
  value: string;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  testResult?: MirrorTestResult;
  isFastest?: boolean;
  badge?: React.ReactNode;
}

function MirrorOption ({
  label,
  description,
  isSelected,
  onSelect,
  testResult,
  isFastest,
  badge,
}: MirrorOptionProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all',
        'bg-content1 hover:bg-content2 border-2',
        isSelected ? 'border-primary' : 'border-transparent',
        isFastest && 'ring-2 ring-success'
      )}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-default-500 truncate">{description}</p>
      </div>
      <div className="flex items-center gap-2 ml-2">
        {badge}
        {isFastest && !badge && (
          <Chip size="sm" color="success" variant="flat">最快</Chip>
        )}
        {testResult && <MirrorStatus result={testResult} />}
      </div>
    </div>
  );
}

// 镜像状态显示组件
function MirrorStatus ({ result }: { result: MirrorTestResult; }) {
  const formatLatency = (latency: number) => {
    if (latency >= 5000) return '>5s';
    if (latency >= 1000) return `${(latency / 1000).toFixed(1)}s`;
    return `${latency}ms`;
  };

  if (!result.success) {
    return (
      <Tooltip content={result.error || '连接失败'}>
        <Chip
          size="sm"
          color="danger"
          variant="flat"
          startContent={<IoMdClose size={14} />}
        >
          失败
        </Chip>
      </Tooltip>
    );
  }

  const getColor = (): 'success' | 'warning' | 'danger' => {
    if (result.latency < 300) return 'success';
    if (result.latency < 1000) return 'warning';
    return 'danger';
  };

  return (
    <Chip
      size="sm"
      color={getColor()}
      variant="flat"
      startContent={<IoMdCheckmark size={14} />}
    >
      {formatLatency(result.latency)}
    </Chip>
  );
}
