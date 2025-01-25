import { Select, SelectItem } from '@heroui/select'
import { SharedSelection } from '@heroui/system'
import type { Selection } from '@react-types/shared'

export interface FilterMessageTypeProps {
  filterTypes: Selection
  onSelectionChange: (keys: SharedSelection) => void
}
const items = [
  { label: '元事件', value: 'meta_event' },
  { label: '消息', value: 'message' },
  { label: '请求', value: 'request' },
  { label: '通知', value: 'notice' },
  { label: '消息发送', value: 'message_sent' }
]
const FilterMessageType: React.FC<FilterMessageTypeProps> = (props) => {
  const { filterTypes, onSelectionChange } = props
  return (
    <Select
      selectedKeys={filterTypes}
      onSelectionChange={(selectedKeys) => {
        if (selectedKeys !== 'all' && selectedKeys?.size === 0) {
          selectedKeys = 'all'
        }
        onSelectionChange(selectedKeys)
      }}
      label="筛选消息类型"
      selectionMode="multiple"
      items={items}
      renderValue={(value) => {
        if (value.length === items.length) {
          return '全部'
        }
        return value.map((v) => v.data?.label).join(',')
      }}
    >
      {(item) => (
        <SelectItem key={item.value} value={item.value}>
          {item.label}
        </SelectItem>
      )}
    </Select>
  )
}

export const renderFilterMessageType = (
  filterTypes: Selection,
  onSelectionChange: (keys: SharedSelection) => void
) => {
  return (
    <FilterMessageType
      filterTypes={filterTypes}
      onSelectionChange={onSelectionChange}
    />
  )
}

export default FilterMessageType
