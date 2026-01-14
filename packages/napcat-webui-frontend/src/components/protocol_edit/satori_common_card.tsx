
import { Button } from '@heroui/button';
import { Switch } from '@heroui/switch';
import clsx from 'clsx';
import { useState } from 'react';
import { CgDebug } from 'react-icons/cg';
import { FiEdit3 } from 'react-icons/fi';
import { MdDeleteForever } from 'react-icons/md';

import DisplayCardContainer from '@/components/display_card/container';

export interface SatoriDisplayCardField {
  label: string;
  value: string | number | boolean | undefined;
  render?: (value: any) => React.ReactNode;
}

export interface SatoriDisplayCardProps {
  data: SatoriWebSocketServerConfig | SatoriHttpServerConfig | SatoriWebHookClientConfig;
  typeLabel: string;
  fields: SatoriDisplayCardField[];
  onEdit: () => void;
  onEnable: () => Promise<void>;
  onDelete: () => Promise<void>;
  onEnableDebug: () => Promise<void>;
  showType?: boolean;
}

const SatoriDisplayCard: React.FC<SatoriDisplayCardProps> = ({
  data,
  typeLabel,
  fields,
  onEdit,
  onEnable,
  onDelete,
  onEnableDebug,
  showType,
}) => {
  const { name, enable, debug } = data;
  const [editing, setEditing] = useState(false);

  const handleEnable = () => {
    setEditing(true);
    onEnable().finally(() => setEditing(false));
  };

  const handleDelete = () => {
    setEditing(true);
    onDelete().finally(() => setEditing(false));
  };

  const handleEnableDebug = () => {
    setEditing(true);
    onEnableDebug().finally(() => setEditing(false));
  };

  const isFullWidthField = (label: string) => ['WebHook URL', 'Token', '路径'].includes(label);

  return (
    <DisplayCardContainer
      className='w-full'
      tag={showType ? typeLabel : undefined}
      action={
        <div className='flex gap-2 w-full'>
          <Button
            fullWidth
            radius='full'
            size='sm'
            variant='flat'
            className='flex-1 bg-default-100 dark:bg-default-50 text-default-600 font-medium hover:bg-warning/20 hover:text-warning transition-colors'
            startContent={<FiEdit3 size={16} />}
            onPress={onEdit}
            isDisabled={editing}
          >
            编辑
          </Button>

          <Button
            fullWidth
            radius='full'
            size='sm'
            variant='flat'
            className={clsx(
              'flex-1 bg-default-100 dark:bg-default-50 text-default-600 font-medium transition-colors',
              debug
                ? 'hover:bg-secondary/20 hover:text-secondary data-[hover=true]:text-secondary'
                : 'hover:bg-success/20 hover:text-success data-[hover=true]:text-success'
            )}
            startContent={<CgDebug size={16} />}
            onPress={handleEnableDebug}
            isDisabled={editing}
          >
            {debug ? '关闭调试' : '开启调试'}
          </Button>
          <Button
            fullWidth
            radius='full'
            size='sm'
            variant='flat'
            className='flex-1 bg-default-100 dark:bg-default-50 text-default-600 font-medium hover:bg-danger/20 hover:text-danger transition-colors'
            startContent={<MdDeleteForever size={16} />}
            onPress={handleDelete}
            isDisabled={editing}
          >
            删除
          </Button>
        </div>
      }
      enableSwitch={
        <Switch
          isDisabled={editing}
          isSelected={enable}
          onChange={handleEnable}
          classNames={{
            wrapper: 'group-data-[selected=true]:bg-primary-400',
          }}
        />
      }
      title={name}
    >
      <div className='grid grid-cols-2 gap-3'>
        {(() => {
          const targetFullField = fields.find(f => isFullWidthField(f.label));

          if (targetFullField) {
            return (
              <>
                <div
                  className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors col-span-2'
                >
                  <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>类型</span>
                  <div className='text-sm font-medium text-default-700 dark:text-white/90 truncate'>
                    {typeLabel}
                  </div>
                </div>
                <div
                  className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors col-span-2'
                >
                  <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>{targetFullField.label}</span>
                  <div className='text-sm font-medium text-default-700 dark:text-white/90 truncate'>
                    {targetFullField.render
                      ? targetFullField.render(targetFullField.value)
                      : (
                        <span className={clsx(
                          typeof targetFullField.value === 'string' && (targetFullField.value.startsWith('http') || targetFullField.value.includes('.') || targetFullField.value.includes(':')) ? 'font-mono' : ''
                        )}
                        >
                          {String(targetFullField.value)}
                        </span>
                      )}
                  </div>
                </div>
              </>
            );
          } else {
            const displayFields = fields.slice(0, 3);
            return (
              <>
                <div
                  className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'
                >
                  <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>类型</span>
                  <div className='text-sm font-medium text-default-700 dark:text-white/90 truncate'>
                    {typeLabel}
                  </div>
                </div>
                {displayFields.map((field, index) => (
                  <div
                    key={index}
                    className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'
                  >
                    <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>{field.label}</span>
                    <div className='text-sm font-medium text-default-700 dark:text-white/90 truncate'>
                      {field.render
                        ? (
                          field.render(field.value)
                        )
                        : (
                          <span className={clsx(
                            typeof field.value === 'string' && (field.value.startsWith('http') || field.value.includes('.') || field.value.includes(':')) ? 'font-mono' : ''
                          )}
                          >
                            {String(field.value)}
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </>
            );
          }
        })()}
      </div>
    </DisplayCardContainer>
  );
};

export default SatoriDisplayCard;
