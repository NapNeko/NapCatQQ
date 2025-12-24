import { Accordion, AccordionItem } from '@heroui/accordion';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { useRequest } from 'ahooks';
import clsx from 'clsx';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaFont, FaUserAstronaut, FaCheck } from 'react-icons/fa';
import { FaPaintbrush } from 'react-icons/fa6';
import { IoIosColorPalette } from 'react-icons/io';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { IoMdRefresh } from 'react-icons/io';

import themes from '@/const/themes';

import ColorPicker from '@/components/ColorPicker';
import FileInput from '@/components/input/file_input';
import PageLoading from '@/components/page_loading';

import FileManager from '@/controllers/file_manager';
import { applyFont, colorKeys, generateTheme, loadTheme, updateFontCache } from '@/utils/theme';

import WebUIManager from '@/controllers/webui_manager';

export type PreviewThemeCardProps = {
  theme: ThemeInfo;
  onPreview: () => void;
  isSelected?: boolean;
};

const values = [
  '',
  '-50',
  '-100',
  '-200',
  '-300',
  '-400',
  '-500',
  '-600',
  '-700',
  '-800',
  '-900',
];
const colors = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'default',
];

function PreviewThemeCard ({ theme, onPreview, isSelected }: PreviewThemeCardProps) {
  const style = document.createElement('style');
  style.innerHTML = generateTheme(theme.theme, theme.name);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return (
    <Card
      ref={cardRef}
      shadow='sm'
      radius='sm'
      isPressable
      onPress={onPreview}
      className={clsx(
        'text-primary bg-primary-50 relative transition-all',
        theme.name,
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {isSelected && (
        <div className="absolute top-1 right-1 z-10">
          <Chip size="sm" color="primary" variant="solid">
            <FaCheck size={10} />
          </Chip>
        </div>
      )}
      <CardHeader className='pb-0 flex flex-col items-start gap-1'>
        <div className='px-1 rounded-md bg-primary text-primary-foreground'>
          {theme.name}
        </div>
        <div className='text-xs flex items-center gap-1 text-primary-300'>
          <FaUserAstronaut />
          {theme.author ?? '未知'}
        </div>
        <div className='text-xs text-primary-200'>{theme.description}</div>
      </CardHeader>
      <CardBody>
        <div className='flex flex-col gap-1'>
          {colors.map((color) => (
            <div className='flex gap-1 items-center flex-wrap' key={color}>
              <div className='text-xs w-4 text-right'>
                {color[0].toUpperCase()}
              </div>
              {values.map((value) => (
                <div
                  key={value}
                  className={clsx(
                    'w-2 h-2 rounded-full shadow-small',
                    `bg-${color}${value}`
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// 比较两个主题配置是否相同（不比较 fontMode）
const isThemeColorsEqual = (a: ThemeConfig, b: ThemeConfig): boolean => {
  if (!a || !b) return false;
  const aKeys = [...Object.keys(a.light || {}), ...Object.keys(a.dark || {})];
  const bKeys = [...Object.keys(b.light || {}), ...Object.keys(b.dark || {})];
  if (aKeys.length !== bKeys.length) return false;

  for (const key of Object.keys(a.light || {})) {
    if (a.light?.[key as keyof ThemeConfigItem] !== b.light?.[key as keyof ThemeConfigItem]) return false;
  }
  for (const key of Object.keys(a.dark || {})) {
    if (a.dark?.[key as keyof ThemeConfigItem] !== b.dark?.[key as keyof ThemeConfigItem]) return false;
  }
  return true;
};

// 字体模式显示名称映射
const fontModeNames: Record<string, string> = {
  'aacute': 'Aa 偷吃可爱长大的',
  'system': '系统默认',
  'custom': '自定义字体',
};

const ThemeConfigCard = () => {
  const { data, loading, error, refreshAsync } = useRequest(
    WebUIManager.getThemeConfig
  );
  const {
    control,
    handleSubmit: handleOnebotSubmit,
    formState: { isSubmitting },
    setValue: setOnebotValue,
  } = useForm<{
    theme: ThemeConfig;
  }>({
    defaultValues: {
      theme: {
        dark: {},
        light: {},
        fontMode: 'aacute',
      },
    },
  });

  const [dataLoaded, setDataLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 使用 useRef 存储 style 标签引用
  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  const originalDataRef = useRef<ThemeConfig | null>(null);

  // 在组件挂载时创建 style 标签，并在卸载时清理
  useEffect(() => {
    const styleTag = document.createElement('style');
    document.head.appendChild(styleTag);
    styleTagRef.current = styleTag;
    return () => {
      if (styleTagRef.current) {
        document.head.removeChild(styleTagRef.current);
      }
    };
  }, []);

  const theme = useWatch({ control, name: 'theme' });

  // 检测是否有未保存的更改
  useEffect(() => {
    if (originalDataRef.current && dataLoaded) {
      const colorsChanged = !isThemeColorsEqual(theme, originalDataRef.current);
      const fontChanged = theme.fontMode !== originalDataRef.current.fontMode;
      setHasUnsavedChanges(colorsChanged || fontChanged);
    }
  }, [theme, dataLoaded]);

  const reset = useCallback(() => {
    if (data) {
      setOnebotValue('theme', data);
      originalDataRef.current = data;
      // 应用已保存的字体设置
      if (data.fontMode) {
        applyFont(data.fontMode);
      }
    }
    setDataLoaded(true);
    setHasUnsavedChanges(false);
  }, [data, setOnebotValue]);

  // 实时应用字体预设（预览）
  useEffect(() => {
    if (dataLoaded && theme.fontMode) {
      applyFont(theme.fontMode);
    }
  }, [theme.fontMode, dataLoaded]);

  const onSubmit = handleOnebotSubmit(async (formData) => {
    try {
      await WebUIManager.setThemeConfig(formData.theme);
      // 更新原始数据引用
      originalDataRef.current = formData.theme;
      // 更新字体缓存
      if (formData.theme.fontMode) {
        updateFontCache(formData.theme.fontMode);
      }
      setHasUnsavedChanges(false);
      toast.success('保存成功');
      loadTheme();
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`保存失败: ${msg}`);
    }
  });

  const onRefresh = async () => {
    try {
      await refreshAsync();
      toast.success('刷新成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`刷新失败: ${msg}`);
    }
  };

  useEffect(() => {
    reset();
  }, [data, reset]);

  useEffect(() => {
    if (theme && styleTagRef.current) {
      const css = generateTheme(theme);
      styleTagRef.current.innerHTML = css;
    }
  }, [theme]);

  // 找到当前选中的主题（预览中的）
  const selectedThemeName = useMemo(() => {
    return themes.find(t => isThemeColorsEqual(t.theme, theme))?.name;
  }, [theme]);

  // 找到已保存的主题名称
  const savedThemeName = useMemo(() => {
    if (!originalDataRef.current) return null;
    return themes.find(t => isThemeColorsEqual(t.theme, originalDataRef.current!))?.name || '自定义';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded, hasUnsavedChanges]);

  // 已保存的字体模式显示名称
  const savedFontModeDisplayName = useMemo(() => {
    const mode = originalDataRef.current?.fontMode || 'aacute';
    return fontModeNames[mode] || mode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded, hasUnsavedChanges]);

  if (loading) return <PageLoading loading />;

  if (error) {
    return (
      <div className='py-24 text-danger-500 text-center'>{error.message}</div>
    );
  }

  return (
    <>
      <title>主题配置 - NapCat WebUI</title>

      {/* 顶部操作栏 */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-divider">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-default-400">当前主题:</span>
              <Chip size="sm" color="primary" variant="flat">
                {savedThemeName || '加载中...'}
              </Chip>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-default-400">字体:</span>
              <Chip size="sm" color="secondary" variant="flat">
                {savedFontModeDisplayName}
              </Chip>
            </div>
            {hasUnsavedChanges && (
              <Chip size="sm" color="warning" variant="solid">
                有未保存的更改
              </Chip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              radius="full"
              variant="flat"
              className="font-medium bg-default-100 text-default-600 dark:bg-default-50/50"
              onPress={() => {
                reset();
                toast.success('已重置');
              }}
              isDisabled={!hasUnsavedChanges}
            >
              取消更改
            </Button>
            <Button
              size="sm"
              color='primary'
              radius="full"
              className="font-medium shadow-md shadow-primary/20"
              isLoading={isSubmitting}
              onPress={() => onSubmit()}
              isDisabled={!hasUnsavedChanges}
            >
              保存
            </Button>
            <Button
              size="sm"
              isIconOnly
              radius='full'
              variant='flat'
              className="text-default-500 bg-default-100 dark:bg-default-50/50"
              onPress={onRefresh}
            >
              <IoMdRefresh size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Accordion variant='splitted' defaultExpandedKeys={['font', 'select']}>
          <AccordionItem
            key='font'
            aria-label='Font Settings'
            title='字体设置'
            subtitle='自定义WebUI显示的字体'
            className='shadow-small'
            startContent={<FaFont />}
          >
            <div className='flex flex-col gap-4'>
              <Controller
                control={control}
                name="theme.fontMode"
                render={({ field }) => (
                  <Select
                    label="字体预设"
                    selectedKeys={field.value ? [field.value] : ['aacute']}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="max-w-xs"
                    disallowEmptySelection
                  >
                    <SelectItem key="aacute">Aa 偷吃可爱长大的</SelectItem>
                    <SelectItem key="system">系统默认</SelectItem>
                    <SelectItem key="custom">自定义字体</SelectItem>
                  </Select>
                )}
              />
              <div className='p-3 rounded-lg bg-default-100 dark:bg-default-50/30'>
                <div className='text-sm text-default-500 mb-2'>
                  上传自定义字体（仅在选择"自定义字体"时生效）
                </div>
                <FileInput
                  label='上传字体文件'
                  placeholder='选择字体文件 (.woff/.woff2/.ttf/.otf)'
                  accept='.ttf,.otf,.woff,.woff2'
                  onChange={async (file) => {
                    try {
                      await FileManager.uploadWebUIFont(file);
                      toast.success('上传成功，即将刷新页面');
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    } catch (error) {
                      toast.error('上传失败: ' + (error as Error).message);
                    }
                  }}
                  onDelete={async () => {
                    try {
                      await FileManager.deleteWebUIFont();
                      toast.success('删除成功，即将刷新页面');
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    } catch (error) {
                      toast.error('删除失败: ' + (error as Error).message);
                    }
                  }}
                />
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            key='select'
            aria-label='Pick Color'
            title='选择主题'
            subtitle='点击主题卡片即可预览，记得保存'
            className='shadow-small'
            startContent={<IoIosColorPalette />}
          >
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
              {themes.map((t) => (
                <PreviewThemeCard
                  key={t.name}
                  theme={t}
                  isSelected={selectedThemeName === t.name}
                  onPreview={() => {
                    setOnebotValue('theme', { ...t.theme, fontMode: theme.fontMode });
                  }}
                />
              ))}
            </div>
          </AccordionItem>

          <AccordionItem
            key='pick'
            aria-label='Pick Color'
            title='自定义配色'
            subtitle='精细调整每个颜色变量'
            className='shadow-small'
            startContent={<FaPaintbrush />}
          >
            <div className='space-y-4'>
              {(['light', 'dark'] as const).map((mode) => (
                <div
                  key={mode}
                  className={clsx(
                    'p-4 rounded-lg',
                    mode === 'dark' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-black'
                  )}
                >
                  <h3 className='flex items-center justify-center gap-2 p-2 rounded-md bg-opacity-20 mb-4 font-medium'>
                    {mode === 'dark' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
                    {mode === 'dark' ? '深色模式' : '浅色模式'}
                  </h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {colorKeys.map((colorKey) => (
                      <div
                        key={colorKey}
                        className='flex items-center gap-2 p-2 rounded bg-black/5 dark:bg-white/5'
                      >
                        <Controller
                          control={control}
                          name={`theme.${mode}.${colorKey}`}
                          render={({ field: { value, onChange } }) => {
                            const hslArray = value?.split(' ') ?? [0, 0, 0];
                            const color = `hsl(${hslArray[0]}, ${hslArray[1]}, ${hslArray[2]})`;
                            return (
                              <ColorPicker
                                color={color}
                                onChange={(result) => {
                                  onChange(
                                    `${result.hsl.h} ${result.hsl.s * 100}% ${result.hsl.l * 100}%`
                                  );
                                }}
                              />
                            );
                          }}
                        />
                        <span className='text-xs font-mono truncate flex-1' title={colorKey}>
                          {colorKey.replace('--heroui-', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};

export default ThemeConfigCard;
