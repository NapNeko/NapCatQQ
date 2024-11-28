import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { Input } from '@nextui-org/input'
import { Button } from '@nextui-org/button'
import { Select, SelectItem } from '@nextui-org/select'
import { ModalBody, ModalFooter } from '@nextui-org/modal'
import { useEffect } from 'react'

import SwitchCard from '../switch_card'

export interface HTTPServerFormProps {
  data?: OneBotConfig['network']['httpServers'][0]
  onClose: () => void
  onSubmit: (data: OneBotConfig['network']['httpServers'][0]) => Promise<void>
}
const HTTPServerForm: React.FC<HTTPServerFormProps> = ({
  data,
  onClose,
  onSubmit
}) => {
  const { control, handleSubmit, formState, setValue, reset } = useForm<
    OneBotConfig['network']['httpServers'][0]
  >({
    defaultValues: {
      enable: false,
      name: '',
      host: '0.0.0.0',
      port: 3000,
      enableCors: true,
      enableWebsocket: true,
      messagePostFormat: 'array',
      token: '',
      debug: false
    }
  })
  const submitAction: SubmitHandler<
    OneBotConfig['network']['httpServers'][0]
  > = async (data) => {
    await onSubmit(data)
    onClose()
  }
  const isEdit = !!data

  useEffect(() => {
    if (data) {
      setValue('enable', data.enable)
      setValue('name', data.name)
      setValue('host', data.host)
      setValue('port', data.port)
      setValue('enableCors', data.enableCors)
      setValue('enableWebsocket', data.enableWebsocket)
      setValue('messagePostFormat', data.messagePostFormat)
      setValue('token', data.token)
      setValue('debug', data.debug)
    } else {
      reset()
    }
  }, [data, reset])

  return (
    <>
      <ModalBody>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Controller
              control={control}
              name="enable"
              render={({ field }) => (
                <SwitchCard
                  {...field}
                  description="保存后启用此配置"
                  label="启用"
                />
              )}
            />
            <Controller
              control={control}
              name="debug"
              render={({ field }) => (
                <SwitchCard
                  {...field}
                  description="是否开启调试模式"
                  label="开启Debug"
                />
              )}
            />
          </div>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                isDisabled={isEdit}
                label="名称"
                placeholder="请输入名称"
              />
            )}
            rules={{ required: '请填写用于唯一标识和方便记住的名称' }}
          />
          <Controller
            control={control}
            name="host"
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                label="Host"
                placeholder="请输入主机地址"
              />
            )}
            rules={{ required: '请填写主机地址' }}
          />
          <Controller
            control={control}
            name="port"
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                label="Port"
                placeholder="请输入端口"
                value={field.value ? field.value.toString() : '0'}
                onChange={(e) => {
                  const port = parseInt(e.target.value)

                  if (port < 0 || port > 65535) {
                    return
                  }
                  field.onChange(port)
                }}
              />
            )}
            rules={{ required: '请填写端口' }}
          />
          <div className="grid grid-cols-2 gap-2">
            <Controller
              control={control}
              name="enableCors"
              render={({ field }) => (
                <SwitchCard
                  {...field}
                  description="是否启用CORS跨域"
                  label="启用CORS"
                />
              )}
            />
            <Controller
              control={control}
              name="enableWebsocket"
              render={({ field }) => (
                <SwitchCard
                  {...field}
                  description="是否启用Websocket"
                  label="启用Websocket"
                />
              )}
            />
          </div>
          <Controller
            control={control}
            name="messagePostFormat"
            render={({ field }) => (
              <Select
                {...field}
                isRequired
                label="消息格式"
                placeholder="请选择消息格式"
                selectedKeys={[field.value]}
              >
                <SelectItem key="array" value="array">
                  Array
                </SelectItem>
                <SelectItem key="string" value="string">
                  String
                </SelectItem>
              </Select>
            )}
            rules={{ required: '请选择消息格式' }}
          />
          <Controller
            control={control}
            name="token"
            render={({ field }) => (
              <Input {...field} label="Token" placeholder="请输入Token" />
            )}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          isDisabled={formState.isSubmitting}
          variant="light"
          onPress={onClose}
        >
          关闭
        </Button>
        <Button
          color="primary"
          isLoading={formState.isSubmitting}
          onClick={handleSubmit(submitAction)}
        >
          保存
        </Button>
      </ModalFooter>
    </>
  )
}

export default HTTPServerForm
