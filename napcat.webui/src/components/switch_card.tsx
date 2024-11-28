import React, { forwardRef } from 'react'
import { Switch } from '@nextui-org/switch'
import clsx from 'clsx'

export interface SwitchCardProps {
  label?: string
  description?: string
  value?: boolean
  onValueChange?: (value: boolean) => void
  name?: string
  onBlur?: React.FocusEventHandler
  disabled?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const SwitchCard = forwardRef<HTMLInputElement, SwitchCardProps>(
  (props, ref) => {
    const { label, description, value, onValueChange, disabled } = props
    const selectString = value ? 'true' : 'false'

    return (
      <Switch
        classNames={{
          base: clsx(
            'inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center',
            'justify-between cursor-pointer rounded-lg gap-2 p-3 border-2 border-transparent',
            'data-[selected=true]:border-primary'
          ),
          wrapper: 'p-0 h-4 overflow-visible',
          thumb: clsx(
            'w-6 h-6 border-2 shadow-lg',
            'group-data-[hover=true]:border-primary',
            //selected
            'group-data-[selected=true]:ml-6',
            // pressed
            'group-data-[pressed=true]:w-7',
            'group-data-[selected]:group-data-[pressed]:ml-4'
          )
        }}
        {...props}
        ref={ref}
        isDisabled={disabled}
        isSelected={value}
        value={selectString}
        onValueChange={onValueChange}
      >
        <div className="flex flex-col gap-1">
          <p className="text-medium">{label}</p>
          <p className="text-tiny text-default-400">{description}</p>
        </div>
      </Switch>
    )
  }
)

SwitchCard.displayName = 'SwitchCard'

export default SwitchCard
