import React, { useMemo } from 'react';

import { useTheme } from '@/hooks/use-theme';

interface UsagePieProps {
  systemUsage: number;
  processUsage: number;
  title?: string;
}

const UsagePie: React.FC<UsagePieProps> = ({
  systemUsage,
  processUsage,
  title,
}) => {
  const { theme } = useTheme();

  // Ensure values are clean
  const cleanSystem = Math.min(Math.max(systemUsage || 0, 0), 100);
  const cleanProcess = Math.min(Math.max(processUsage || 0, 0), cleanSystem);

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

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg
        className="w-full h-full -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track / Free Space */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.track}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* System Usage (Background for QQ) - effectively "Others" + "QQ" */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.other}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={systemDash}
          className="transition-all duration-700 ease-out"
        />

        {/* QQ Usage - Layered on top */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.qq}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={processDash}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        {title && (
          <span className="text-[10px] text-default-500 font-medium mb-0.5 opacity-80 uppercase tracking-widest scale-90">
            {title}
          </span>
        )}
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-default-900 dark:text-gray-100">
            {Math.round(cleanSystem)}
          </span>
          <span className="text-xs text-default-400 font-bold">%</span>
        </div>
      </div>
    </div>
  );
};

export default UsagePie;
