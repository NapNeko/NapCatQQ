import GenericForm from './generic_form'
import type { Field } from './generic_form'

export interface WebsocketClientFormProps {
  data?: OneBotConfig['network']['websocketClients'][0]
  onClose: () => void
  onSubmit: (
    data: OneBotConfig['network']['websocketClients'][0]
  ) => Promise<void>
}

type WebsocketClientFormType = OneBotConfig['network']['websocketClients']

const WebsocketClientForm: React.FC<WebsocketClientFormProps> = ({
  data,
  onClose,
  onSubmit
}) => {
  const defaultValues: WebsocketClientFormType[0] = {
    enable: false,
    name: '',
    url: 'ws://localhost:8082',
    reportSelfMessage: false,
    messagePostFormat: 'array',
    token: '',
    debug: false,
    heartInterval: 30000,
    reconnectInterval: 30000
  }

  const fields: Field<'websocketClients'>[] = [
    {
      name: 'enable',
      label: '启用',
      type: 'switch',
      description: '保存后启用此配置',
      colSpan: 1
    },
    {
      name: 'debug',
      label: '开启Debug',
      type: 'switch',
      description: '是否开启调试模式',
      colSpan: 1
    },
    {
      name: 'name',
      label: '名称',
      type: 'input',
      placeholder: '请输入名称',
      isRequired: true,
      isDisabled: !!data
    },
    {
      name: 'url',
      label: 'URL',
      type: 'input',
      placeholder: '请输入URL',
      isRequired: true
    },
    {
      name: 'reportSelfMessage',
      label: '上报自身消息',
      type: 'switch',
      description: '是否上报自身消息',
      colSpan: 1
    },
    {
      name: 'messagePostFormat',
      label: '消息格式',
      type: 'select',
      placeholder: '请选择消息格式',
      isRequired: true,
      options: [
        { key: 'array', value: 'Array' },
        { key: 'string', value: 'String' }
      ],
      colSpan: 1
    },
    {
      name: 'token',
      label: 'Token',
      type: 'input',
      placeholder: '请输入Token'
    },
    {
      name: 'heartInterval',
      label: '心跳间隔',
      type: 'input',
      placeholder: '请输入心跳间隔',
      isRequired: true,
      colSpan: 1
    },
    {
      name: 'reconnectInterval',
      label: '重连间隔',
      type: 'input',
      placeholder: '请输入重连间隔',
      isRequired: true,
      colSpan: 1
    }
  ]

  return (
    <GenericForm
      data={data}
      defaultValues={defaultValues}
      onClose={onClose}
      onSubmit={onSubmit}
      fields={fields}
    />
  )
}

export default WebsocketClientForm
