import { Input } from '@heroui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// 转换 HSL 字符串到对象
const parseHsl = (hslStr: string) => {
  const match = hslStr.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
  if (match) {
    return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
  }
  return { h: 0, s: 0, l: 0 };
};

// 转换 HEX 到 HSL
const hexToHsl = (hex: string) => {
  let r = 0; let g = 0; let b = 0;
  if (hex.length === 4) {
    r = parseInt('0x' + hex[1] + hex[1]);
    g = parseInt('0x' + hex[2] + hex[2]);
    b = parseInt('0x' + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt('0x' + hex[1] + hex[2]);
    g = parseInt('0x' + hex[3] + hex[4]);
    b = parseInt('0x' + hex[5] + hex[6]);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
};

// 转换 HSL 到 HEX
const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0; let g = 0; let b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
};

interface PanelProps {
  hsl: { h: number, s: number, l: number; };
  onChange: (newHsl: { h: number, s: number, l: number; }) => void;
}

// 饱和度/亮度面板
const SatLightPanel = memo(({ hsl, onChange }: PanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const hslRef = useRef(hsl);
  useEffect(() => { hslRef.current = hsl; }, [hsl]);

  const updateColor = useCallback((clientX: number, clientY: number) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    const s_hsv = x;
    const v_hsv = 1 - y;

    const l_hsl = v_hsv * (1 - s_hsv / 2);
    let s_hsl = 0;
    if (l_hsl === 0 || l_hsl === 1) {
      s_hsl = 0;
    } else {
      s_hsl = (v_hsv - l_hsl) / Math.min(l_hsl, 1 - l_hsl);
    }

    onChange({ h: hslRef.current.h, s: s_hsl * 100, l: l_hsl * 100 });
  }, [onChange]);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    updateColor(clientX, clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        updateColor(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        updateColor(touch.clientX, touch.clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updateColor]);

  const l_val = hsl.l / 100;
  const s_val = hsl.s / 100;
  const v_hsv = l_val + s_val * Math.min(l_val, 1 - l_val);
  const s_hsv = v_hsv === 0 ? 0 : 2 * (1 - l_val / v_hsv);

  const markerX = s_hsv * 100;
  const markerY = (1 - v_hsv) * 100;

  return (
    <div
      ref={panelRef}
      className='w-full h-40 rounded-lg relative cursor-crosshair overflow-hidden shadow-inner touch-none'
      style={{
        backgroundColor: 'hsl(' + hsl.h + ', 100%, 50%)',
        backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className='w-4 h-4 rounded-full border-2 border-white shadow-md absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none'
        style={{
          left: markerX + '%',
          top: markerY + '%',
          backgroundColor: 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)',
        }}
      />
    </div>
  );
});

SatLightPanel.displayName = 'SatLightPanel';

const HueSlider = memo(({ hsl, onChange }: PanelProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const hslRef = useRef(hsl);
  useEffect(() => { hslRef.current = hsl; }, [hsl]);

  const updateHue = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    x = Math.max(0, Math.min(1, x));
    onChange({ ...hslRef.current, h: x * 360 });
  }, [onChange]);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    updateHue(clientX);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        updateHue(e.clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        updateHue(touch.clientX);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updateHue]);

  return (
    <div
      ref={sliderRef}
      className='w-full h-4 rounded-full relative cursor-pointer mt-3 shadow-inner touch-none'
      style={{
        background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className='w-4 h-4 rounded-full border-2 border-white shadow-md absolute top-0 transform -translate-x-1/2 pointer-events-none bg-white'
        style={{ left: (hsl.h / 360) * 100 + '%' }}
      />
    </div>
  );
});

HueSlider.displayName = 'HueSlider';

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [hsl, setHsl] = useState(parseHsl(color));
  const [hex, setHex] = useState(hslToHex(hsl.h, hsl.s, hsl.l));
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (isDraggingRef.current) return;
    const newHsl = parseHsl(color);
    if (Math.abs(newHsl.h - hsl.h) > 0.1 || Math.abs(newHsl.s - hsl.s) > 0.1 || Math.abs(newHsl.l - hsl.l) > 0.1) {
      setHsl(newHsl);
      setHex(hslToHex(newHsl.h, newHsl.s, newHsl.l));
    }
  }, [color]);

  const handleHslChange = useCallback((newHsl: { h: number, s: number, l: number; }) => {
    setHsl(newHsl);
    setHex(hslToHex(newHsl.h, newHsl.s, newHsl.l));
    onChange('hsl(' + Math.round(newHsl.h) + ', ' + Math.round(newHsl.s) + '%, ' + Math.round(newHsl.l) + '%)');
  }, [onChange]);

  const handleHexChange = (value: string) => {
    setHex(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const newHsl = hexToHsl(value);
      handleHslChange(newHsl);
    }
  };

  return (
    <Popover triggerScaleOnOpen={false} placement='bottom'>
      <PopoverTrigger>
        <div className='flex items-center gap-2 cursor-pointer group'>
          <div
            className='w-10 h-10 rounded-lg shadow-sm border-2 border-default-200 transition-transform group-hover:scale-105'
            style={{ background: color }}
          />
          <div className='flex flex-col'>
            <span className='text-xs font-mono text-default-500'>{hex}</span>
            <span className='text-xs font-mono text-default-400'>HSL({Math.round(hsl.h)}, {Math.round(hsl.s)}%, {Math.round(hsl.l)}%)</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className='w-72 p-4 bg-background/80 backdrop-blur-xl border border-default-200 shadow-2xl rounded-2xl'
        onMouseDownCapture={() => { isDraggingRef.current = true; }}
        onMouseUpCapture={() => { isDraggingRef.current = false; }}
        onTouchStartCapture={() => { isDraggingRef.current = true; }}
        onTouchEndCapture={() => { isDraggingRef.current = false; }}
      >
        <div className='flex flex-col w-full gap-2'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-bold text-default-700'>选择颜色</span>
            <div
              className='w-6 h-6 rounded-full border border-default-200 shadow-sm'
              style={{ background: color }}
            />
          </div>

          <SatLightPanel hsl={hsl} onChange={handleHslChange} />
          <HueSlider hsl={hsl} onChange={handleHslChange} />

          <div className='grid grid-cols-4 gap-2 mt-2 items-center'>
            <span className='text-xs text-default-500 col-span-1'>HEX</span>
            <Input
              size='sm'
              variant='flat'
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className='col-span-3 font-mono'
              classNames={{
                input: 'text-xs uppercase',
                inputWrapper: 'h-8 min-h-8',
              }}
            />
          </div>

          <div className='grid grid-cols-4 gap-2 items-center'>
            <span className='text-xs text-default-500 col-span-1'>HSL</span>
            <div className='col-span-3 flex gap-1'>
              <Input
                size='sm' variant='flat' type='number'
                value={Math.round(hsl.h).toString()}
                onChange={(e) => handleHslChange({ ...hsl, h: Number(e.target.value) })}
                endContent={<span className='text-xs text-default-400'>H</span>}
                classNames={{ input: 'text-xs', inputWrapper: 'h-8 min-h-8 px-1' }}
              />
              <Input
                size='sm' variant='flat' type='number'
                value={Math.round(hsl.s).toString()}
                onChange={(e) => handleHslChange({ ...hsl, s: Number(e.target.value) })}
                endContent={<span className='text-xs text-default-400'>S</span>}
                classNames={{ input: 'text-xs', inputWrapper: 'h-8 min-h-8 px-1' }}
              />
              <Input
                size='sm' variant='flat' type='number'
                value={Math.round(hsl.l).toString()}
                onChange={(e) => handleHslChange({ ...hsl, l: Number(e.target.value) })}
                endContent={<span className='text-xs text-default-400'>L</span>}
                classNames={{ input: 'text-xs', inputWrapper: 'h-8 min-h-8 px-1' }}
              />
            </div>
          </div>

          <div className='flex gap-1 mt-2 flex-wrap justify-between'>
            {['#006FEE', '#17C964', '#F5A524', '#F31260', '#7828C8', '#000000', '#FFFFFF'].map((c) => (
              <button
                key={c}
                className='w-6 h-6 rounded-full border border-default-200 shadow-sm transition-transform hover:scale-110 active:scale-95'
                style={{ backgroundColor: c }}
                onClick={() => handleHexChange(c)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
