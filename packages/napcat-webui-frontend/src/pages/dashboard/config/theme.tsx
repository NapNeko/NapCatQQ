import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { Tab, Tabs } from '@heroui/tabs';
import { useRequest } from 'ahooks';
import clsx from 'clsx';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaFont, FaUserAstronaut, FaCheck } from 'react-icons/fa';
import { FaPaintbrush } from 'react-icons/fa6';
import { IoIosColorPalette, IoMdRefresh } from 'react-icons/io';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

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
        <div className='absolute top-1 right-1 z-10'>
          <Chip size='sm' color='primary' variant='solid'>
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
        <div className='text-xs text-primary-200 whitespace-nowrap overflow-hidden text-ellipsis w-full'>{theme.description}</div>
      </CardHeader>
      <CardBody>
        <div className='flex flex-col gap-1'>
          {colors.map((color) => (
            <div className='flex gap-1 items-center flex-nowrap' key={color}>
              <div className='text-xs w-4 text-right flex-shrink-0'>
                {color[0].toUpperCase()}
              </div>
              {values.map((value) => (
                <div
                  key={value}
                  className={clsx(
                    'w-2 h-2 rounded-full shadow-small flex-shrink-0',
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
  aacute: 'Aa 偷吃可爱长大的',
  system: '系统默认',
  custom: '自定义字体',
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
  const [customFontExists, setCustomFontExists] = useState(false);

  // 使用 useRef 存储 style 标签引用和状态
  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  const originalDataRef = useRef<ThemeConfig | null>(null);
  const hasUnsavedChangesRef = useRef<boolean>(false);

  // 同步 hasUnsavedChanges 到 ref，供 cleanup 函数使用
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // 在组件挂载时创建 style 标签，并在卸载时清理
  // 同时在卸载时恢复字体到已保存的状态（避免"伪自动保存"问题）
  useEffect(() => {
    const styleTag = document.createElement('style');
    document.head.appendChild(styleTag);
    styleTagRef.current = styleTag;
    return () => {
      // 组件卸载时，只有在有未保存更改时才恢复到已保存的字体设置
      // 避免在刷新页面后字体被意外重置
      if (hasUnsavedChangesRef.current && originalDataRef.current?.fontMode) {
        applyFont(originalDataRef.current.fontMode);
      }
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
    // 检查自定义字体是否存在
    FileManager.checkWebUIFontExists().then(exists => {
      setCustomFontExists(exists);
    }).catch(err => console.error('Failed to check custom font:', err));
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
    const savedData = originalDataRef.current || data;
    if (!savedData) return null;
    return themes.find(t => isThemeColorsEqual(t.theme, savedData))?.name || '自定义';
  }, [data, dataLoaded, hasUnsavedChanges]);

  // 已保存的字体模式显示名称
  const savedFontModeDisplayName = useMemo(() => {
    const savedData = originalDataRef.current || data;
    const mode = savedData?.fontMode || 'aacute';
    return fontModeNames[mode] || mode;
  }, [data, dataLoaded, hasUnsavedChanges]);

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
      <div className='w-full px-4 pt-4 pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-xl font-bold text-default-900 tracking-tight'>外观设置</h1>
            <div className='flex items-center gap-3 text-tiny text-default-500'>
              <div className='flex items-center gap-1.5'>
                <IoIosColorPalette className='text-primary' size={16} />
                <span className='font-medium text-default-700'>{savedThemeName || '加载中...'}</span>
              </div>
              <div className='w-px h-2.5 bg-default-300' />
              <div className='flex items-center gap-1.5'>
                <FaFont className='text-secondary' size={12} />
                <span className='font-medium text-default-700'>{savedFontModeDisplayName}</span>
              </div>
              {hasUnsavedChanges && (
                <>
                  <div className='w-px h-2.5 bg-default-300' />
                  <div className='flex items-center gap-1'>
                    <div className='w-1.5 h-1.5 rounded-full bg-warning animate-pulse' />
                    <span className='text-warning font-semibold'>待保存</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              size='sm'
              variant='flat'
              color='default'
              className='font-medium bg-default-100 hover:bg-default-200 h-9'
              onPress={() => {
                reset();
                toast.success('已重置');
              }}
              isDisabled={!hasUnsavedChanges}
            >
              重置
            </Button>
            <Button
              size='sm'
              color='primary'
              className='font-medium shadow-lg shadow-primary/20 px-6 h-9'
              isLoading={isSubmitting}
              onPress={() => onSubmit()}
              isDisabled={!hasUnsavedChanges}
            >
              保存应用
            </Button>
            <div className='w-px h-6 bg-divider mx-1 hidden sm:block' />
            <Button
              size='sm'
              isIconOnly
              variant='light'
              className='text-default-500 hover:text-default-900 hidden sm:flex'
              onPress={onRefresh}
            >
              <IoMdRefresh size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className='px-4 pt-0 pb-4 w-full h-full'>
        <Tabs
          aria-label='Theme Config Options'
          color='primary'
          variant='underlined'
          disableAnimation
          classNames={{
            tabList: 'gap-8 w-full relative rounded-none p-0 border-b border-divider overflow-x-auto no-scrollbar',
            cursor: 'w-full bg-primary h-[3px] -bottom-[1.5px]',
            tab: 'max-w-fit px-0 h-12 hover:opacity-100 opacity-70 data-[selected=true]:opacity-100',
            tabContent: 'font-semibold py-2',
            panel: 'py-4',
          }}
        >
          <Tab
            key='font'
            title={
              <div className='flex items-center space-x-2'>
                <FaFont />
                <span>字体设置</span>
              </div>
            }
          >
            <Card className='shadow-sm border border-default-100 bg-background/60 backdrop-blur-md w-full'>
              <CardBody className='p-6'>
                <div className='flex flex-col gap-6 w-full'>
                  <div>
                    <h3 className='text-lg font-medium mb-1'>WebUI 字体</h3>
                    <p className='text-sm text-default-500 mb-4'>自定义界面显示的字体风格</p>
                    <Controller
                      control={control}
                      name='theme.fontMode'
                      render={({ field }) => (
                        <Select
                          label='选择字体'
                          variant='bordered'
                          selectedKeys={field.value ? [field.value] : ['aacute']}
                          onChange={(e) => field.onChange(e.target.value)}
                          className='max-w-xs'
                          disallowEmptySelection
                        >
                          <SelectItem key='aacute'>Aa 偷吃可爱长大的</SelectItem>
                          <SelectItem key='system'>系统默认</SelectItem>
                          <SelectItem key='custom'>自定义字体</SelectItem>
                        </Select>
                      )}
                    />
                  </div>

                  {theme.fontMode === 'custom' && (
                    <div className='p-4 rounded-xl bg-default-50 border border-default-100'>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='text-sm font-medium'>自定义字体文件</div>
                        {customFontExists && (
                          <Chip size='sm' color='success' variant='flat' startContent={<FaCheck size={10} />}>
                            已上传
                          </Chip>
                        )}
                      </div>

                      <FileInput
                        label='上传字体文件'
                        placeholder='拖拽或点击上传 (.woff/.woff2/.ttf/.otf)'
                        accept='.ttf,.otf,.woff,.woff2'
                        onChange={async (file) => {
                          try {
                            if (customFontExists) {
                              try {
                                await FileManager.deleteWebUIFont();
                              } catch (e) {
                                console.warn('Failed to delete existing font before upload:', e);
                              }
                            }
                            await FileManager.uploadWebUIFont(file);
                            toast.success('上传成功，即将刷新页面');
                            setTimeout(() => window.location.reload(), 1000);
                          } catch (error) {
                            toast.error('上传失败: ' + (error as Error).message);
                          }
                        }}
                        onDelete={async () => {
                          try {
                            await FileManager.deleteWebUIFont();
                            toast.success('删除成功，即将刷新页面');
                            setTimeout(() => window.location.reload(), 1000);
                          } catch (error) {
                            toast.error('删除失败: ' + (error as Error).message);
                          }
                        }}
                      />
                      <p className='text-xs text-default-400 mt-2'>
                        注意：上传新字体会覆盖旧字体文件，更改后需要刷新页面生效。
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key='theme'
            title={
              <div className='flex items-center space-x-2'>
                <IoIosColorPalette size={18} />
                <span>选择主题</span>
              </div>
            }
          >
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
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
          </Tab>

          <Tab
            key='custom-color'
            title={
              <div className='flex items-center space-x-2'>
                <FaPaintbrush />
                <span>自定义配色</span>
              </div>
            }
          >
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {(['light', 'dark'] as const).map((mode) => (
                <Card key={mode} className={clsx('border shadow-sm', mode === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200')}>
                  <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
                    <div className='flex items-center gap-2 mb-1'>
                      {mode === 'dark' ? <MdDarkMode className='text-zinc-400' size={20} /> : <MdLightMode className='text-orange-400' size={20} />}
                      <h4 className={clsx('font-bold text-large', mode === 'dark' ? 'text-white' : 'text-black')}>
                        {mode === 'dark' ? '深色模式' : '浅色模式'}
                      </h4>
                    </div>
                    <p className={clsx('text-tiny', mode === 'dark' ? 'text-zinc-400' : 'text-zinc-500')}>
                      调整{mode === 'dark' ? '深色' : '浅色'}主题下的颜色变量
                    </p>
                  </CardHeader>
                  <CardBody className='p-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      {colorKeys.map((colorKey) => (
                        <div
                          key={colorKey}
                          className={clsx(
                            'flex items-center gap-3 p-2 rounded-lg border transition-colors',
                            mode === 'dark' ? 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
                          )}
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
                                  onChange={(hslString) => {
                                    const match = hslString.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
                                    if (match) {
                                      onChange(`${match[1]} ${match[2]}% ${match[3]}%`);
                                    }
                                  }}
                                />
                              );
                            }}
                          />
                          <div className='flex flex-col overflow-hidden'>
                            <span className={clsx('text-xs font-medium truncate', mode === 'dark' ? 'text-zinc-300' : 'text-zinc-700')}>
                              {colorKey.replace('--heroui-', '')}
                            </span>
                            <span className={clsx('text-[10px] truncate', mode === 'dark' ? 'text-zinc-500' : 'text-zinc-400')}>
                              Variable
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

export default ThemeConfigCard;
