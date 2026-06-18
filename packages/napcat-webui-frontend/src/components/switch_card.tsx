import { Switch } from '@heroui/switch';
import clsx from 'clsx';
import React, { forwardRef } from 'react';

export interface SwitchCardProps {
  label?: string;
  description?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  name?: string;
  onBlur?: React.FocusEventHandler;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const SwitchCard = forwardRef<HTMLInputElement, SwitchCardProps>(
  (props, ref) => {
    const { label, description, value, onValueChange, disabled } = props;
    const selectString = value ? 'true' : 'false';

    return (
      <Switch
        classNames={{
          base: clsx(
            'inline-flex flex-row-reverse w-full max-w-full bg-default-100/50 dark:bg-white/5 hover:bg-default-200/50 dark:hover:bg-white/10 items-center',
            'justify-between cursor-pointer rounded-xl gap-2 p-4 border border-transparent transition-all duration-200',
            'data-[selected=true]:border-primary/50 data-[selected=true]:bg-primary/5 backdrop-blur-md'
          ),
        }}
        {...props}
        ref={ref}
        isDisabled={disabled}
        isSelected={value}
        value={selectString}
        onValueChange={onValueChange}
      >
        <div className='flex flex-col gap-1'>
          <p className='text-medium'>{label}</p>
          <p className='text-tiny text-default-400'>{description}</p>
        </div>
      </Switch>
    );
  }
);

SwitchCard.displayName = 'SwitchCard';

export default SwitchCard;
