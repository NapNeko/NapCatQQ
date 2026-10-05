import { Card, CardProps } from '@heroui/card';
import clsx from 'clsx';
import React from 'react';

// Firefox 里 backdrop-filter 和 3D transform 作用在同一个元素上时，卡片内容会画不出来
// （#2083，macOS 上的 Firefox 157 复现），所以 Firefox 下不做倾斜，只保留光晕。
const tiltEnabled = !/firefox/i.test(navigator.userAgent);

export interface HoverEffectCardProps extends CardProps {
  children: React.ReactNode
  maxXRotation?: number
  maxYRotation?: number
  lightClassName?: string
  lightStyle?: React.CSSProperties
}

const HoverEffectCard: React.FC<HoverEffectCardProps> = (props) => {
  const {
    children,
    maxXRotation = 5,
    maxYRotation = 5,
    className,
    style,
    lightClassName,
    lightStyle,
  } = props;
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const lightRef = React.useRef<HTMLDivElement | null>(null);
  const [isShowLight, setIsShowLight] = React.useState(false);
  const [pos, setPos] = React.useState({
    left: 0,
    top: 0,
  });

  return (
    <Card
      {...props}
      ref={cardRef}
      className={clsx(
        'relative overflow-hidden bg-opacity-50 backdrop-blur-lg',
        className
      )}
      style={tiltEnabled
        ? {
          willChange: 'transform',
          transform:
              'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          ...style,
        }
        : style}
      onMouseEnter={() => {
        if (tiltEnabled && cardRef.current) {
          cardRef.current.style.transition = 'transform 0.3s ease-out';
        }
      }}
      onMouseLeave={() => {
        setIsShowLight(false);
        if (tiltEnabled && cardRef.current) {
          cardRef.current.style.transition = 'transform 0.5s';
          cardRef.current.style.transform =
            'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
      }}
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current) {
          setIsShowLight(true);

          const { x, y } = cardRef.current.getBoundingClientRect();
          const { clientX, clientY } = e;

          const offsetX = clientX - x;
          const offsetY = clientY - y;

          const lightWidth = lightStyle?.width?.toString() || '100';
          const lightHeight = lightStyle?.height?.toString() || '100';
          const lightWidthNum = parseInt(lightWidth);
          const lightHeightNum = parseInt(lightHeight);

          const left = offsetX - lightWidthNum / 2;
          const top = offsetY - lightHeightNum / 2;

          setPos({
            left,
            top,
          });

          if (!tiltEnabled) {
            return;
          }

          cardRef.current.style.transition = 'transform 0.1s';

          const rangeX = 400 / 2;
          const rangeY = 400 / 2;

          const rotateX = ((offsetY - rangeY) / rangeY) * maxXRotation;
          const rotateY = -1 * ((offsetX - rangeX) / rangeX) * maxYRotation;

          cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
      }}
    >
      <div
        ref={lightRef}
        className={clsx(
          isShowLight ? 'opacity-100' : 'opacity-0',
          'absolute rounded-full blur-[100px] filter transition-opacity duration-300 bg-gradient-to-r from-primary-400 to-secondary-400 w-[150px] h-[150px]',
          lightClassName
        )}
        style={{
          ...pos,
        }}
      />
      {children}
    </Card>
  );
};

export default HoverEffectCard;
