import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { ModalBody, ModalFooter } from '@heroui/modal'
import { Select, SelectItem } from '@heroui/select'
import { ReactElement, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type {
  DefaultValues,
  Path,
  PathValue,
  SubmitHandler
} from 'react-hook-form'
import toast from 'react-hot-toast'

import SwitchCard from '../switch_card'

export type FieldTypes = 'input' | 'select' | 'switch'

type NetworkConfigType = OneBotConfig['network']

export interface Field<T extends keyof OneBotConfig['network']> {
  name: keyof NetworkConfigType[T][0]
  label: string
  type: FieldTypes
  options?: Array<{ key: string; value: string }>
  placeholder?: string
  isRequired?: boolean
  isDisabled?: boolean
  description?: string
  colSpan?: 1 | 2
}

export interface GenericFormProps<T extends keyof NetworkConfigType> {
  data?: NetworkConfigType[T][0]
  defaultValues: DefaultValues<NetworkConfigType[T][0]>
  onClose: () => void
  onSubmit: (data: NetworkConfigType[T][0]) => Promise<void>
  fields: Array<Field<T>>
}

const GenericForm = <T extends keyof NetworkConfigType>({
  data,
  defaultValues,
  onClose,
  onSubmit,
  fields
}: GenericFormProps<T>): ReactElement => {
  const { control, handleSubmit, formState, setValue, reset } = useForm<
    NetworkConfigType[T][0]
  >({
    defaultValues
  })

  const submitAction: SubmitHandler<NetworkConfigType[T][0]> = async (data) => {
    await onSubmit(data)
    onClose()
  }

  const _onSubmit = handleSubmit(submitAction, (e) => {
    for (const error in e) {
      toast.error(e[error]?.message as string)
      return
    }
  })

  useEffect(() => {
    if (data) {
      const keys = Object.keys(data) as Path<NetworkConfig[T][0]>[]
      for (const key of keys) {
        const value = data[key] as PathValue<
          NetworkConfig[T][0],
          Path<NetworkConfig[T][0]>
        >
        setValue(key, value)
      }
    } else {
      reset()
    }
  }, [data, reset, setValue])

  return (
    <>
      <ModalBody>
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 w-full">
          {fields.map((field) => (
            <div
              key={field.name as string}
              className={field.colSpan === 1 ? 'col-span-1' : 'col-span-2'}
            >
              <Controller
                control={control}
                name={field.name as Path<NetworkConfig[T][0]>}
                rules={
                  field.isRequired
                    ? {
                        required: `请填写${field.label}`
                      }
                    : void 0
                }
                render={({ field: controllerField }) => {
                  switch (field.type) {
                    case 'input':
                      return (
                        <Input
                          value={controllerField.value as string}
                          onChange={controllerField.onChange}
                          onBlur={controllerField.onBlur}
                          ref={controllerField.ref}
                          isRequired={field.isRequired}
                          isDisabled={field.isDisabled}
                          label={field.label}
                          placeholder={field.placeholder}
                        />
                      )
                    case 'select':
                      return (
                        <Select
                          {...controllerField}
                          ref={controllerField.ref}
                          isRequired={field.isRequired}
                          label={field.label}
                          placeholder={field.placeholder}
                          selectedKeys={[controllerField.value as string]}
                          value={controllerField.value.toString()}
                        >
                          {field.options?.map((option) => (
                            <SelectItem key={option.key} value={option.value}>
                              {option.value}
                            </SelectItem>
                          )) || <></>}
                        </Select>
                      )
                    case 'switch':
                      return (
                        <SwitchCard
                          {...controllerField}
                          value={controllerField.value as boolean}
                          description={field.description}
                          label={field.label}
                        />
                      )
                    default:
                      return <></>
                  }
                }}
              />
            </div>
          ))}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          isDisabled={formState.isSubmitting}
          variant="light"
          onPress={onClose}
        >
          关闭
        </Button>
        <Button
          color="primary"
          isLoading={formState.isSubmitting}
          onPress={() => _onSubmit()}
        >
          保存
        </Button>
      </ModalFooter>
    </>
  )
}

export default GenericForm
