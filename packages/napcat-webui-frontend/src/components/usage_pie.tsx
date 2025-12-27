import React, { useMemo } from 'react';
import clsx from 'clsx';
import { Tooltip } from '@heroui/tooltip';

import { useTheme } from '@/hooks/use-theme';

interface UsagePieProps {
  systemUsage: number;
  processUsage: number;
  title?: string;
  hasBackground?: boolean;
}

const UsagePie: React.FC<UsagePieProps> = ({
  systemUsage,
  processUsage,
  title,
  hasBackground,
}) => {
  const { theme } = useTheme();

  // Ensure values are clean and consistent
  // Process usage cannot exceed system usage, and system usage cannot be less than process usage.
  const rawSystem = Math.max(systemUsage || 0, 0);
  const rawProcess = Math.max(processUsage || 0, 0);

  const cleanSystem = Math.min(Math.max(rawSystem, rawProcess), 100);
  const cleanProcess = Math.min(rawProcess, cleanSystem);

  // SVG Config
  const size = 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Colors
  const colors = {
    qq: '#D33FF0',
    other: theme === 'dark' ? '#EF8664' : '#EA7D9B',
    track: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
  };

  // Dash Arrays
  // 1. Total System Usage (QQ + Others)
  const systemDash = useMemo(() => {
    return `${(cleanSystem / 100) * circumference} ${circumference}`;
  }, [cleanSystem, circumference]);

  // 2. QQ Usage (Subset of System)
  const processDash = useMemo(() => {
    return `${(cleanProcess / 100) * circumference} ${circumference}`;
  }, [cleanProcess, circumference]);

  // 计算其他进程占用（系统总占用 - QQ占用）
  const otherUsage = Math.max(cleanSystem - cleanProcess, 0);

  // Tooltip 内容
  const tooltipContent = (
    <div className='flex flex-col gap-1 p-1 text-xs'>
      <div className='flex items-center gap-2'>
        <span className='w-2 h-2 rounded-full' style={{ backgroundColor: colors.qq }} />
        <span>QQ进程: {cleanProcess.toFixed(1)}%</span>
      </div>
      <div className='flex items-center gap-2'>
        <span className='w-2 h-2 rounded-full' style={{ backgroundColor: colors.other }} />
        <span>其他进程: {otherUsage.toFixed(1)}%</span>
      </div>
      <div className='flex items-center gap-2'>
        <span className='w-2 h-2 rounded-full' style={{ backgroundColor: colors.track }} />
        <span>空闲: {(100 - cleanSystem).toFixed(1)}%</span>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} placement='top'>
      <div className='relative w-36 h-36 flex items-center justify-center cursor-pointer'>
        <svg
          className='w-full h-full -rotate-90'
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Track / Free Space */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill='none'
            stroke={colors.track}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
          />

          {/* System Usage (Background for QQ) - effectively "Others" + "QQ" */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill='none'
            stroke={colors.other}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={systemDash}
            className='transition-all duration-700 ease-out'
          />

          {/* QQ Usage - Layered on top */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill='none'
            stroke={colors.qq}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={processDash}
            className='transition-all duration-700 ease-out'
          />
        </svg>

        {/* Center Content */}
        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none'>
          {title && (
            <span className={clsx(
              'text-[10px] font-medium mb-0.5 opacity-80 uppercase tracking-widest scale-90',
              hasBackground ? 'text-white/80' : 'text-default-500 dark:text-default-400'
            )}
            >
              {title}
            </span>
          )}
          <div className='flex items-baseline gap-0.5'>
            <span className={clsx(
              'text-2xl font-bold font-mono tracking-tight',
              hasBackground ? 'text-white' : 'text-default-900 dark:text-white'
            )}
            >
              {Math.round(cleanSystem)}
            </span>
            <span className={clsx(
              'text-xs font-bold',
              hasBackground ? 'text-white/60' : 'text-default-400 dark:text-default-500'
            )}
            >%
            </span>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default UsagePie;
