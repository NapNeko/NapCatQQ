import { Avatar } from '@heroui/avatar'
import { Button } from '@heroui/button'
import { Image } from '@heroui/image'
import { Select, SelectItem } from '@heroui/select'
import { IoMdRefresh } from 'react-icons/io'

import { isQQQuickNewItem } from '@/utils/qq'

export interface QQItem {
  uin: string
}

interface QuickLoginProps {
  qqList: (QQItem | LoginListItem)[]
  refresh: boolean
  isLoading: boolean
  selectedQQ: string
  onUpdateQQList: () => void
  handleSelectionChange: React.ChangeEventHandler<HTMLSelectElement>
  onSubmit: () => void
}

const QuickLogin: React.FC<QuickLoginProps> = ({
  qqList,
  refresh,
  isLoading,
  selectedQQ,
  onUpdateQQList,
  handleSelectionChange,
  onSubmit
}) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <Image
          className="shadow-lg"
          height={100}
          radius="full"
          src={`https://q1.qlogo.cn/g?b=qq&nk=${selectedQQ || '0'}&s=100`}
          width={100}
        />
      </div>
      <div className="flex items-center gap-2">
        <Select
          classNames={{
            popoverContent: 'bg-opacity-50 backdrop-blur'
          }}
          aria-label="QQ Login"
          isDisabled={refresh}
          items={qqList}
          placeholder="请选择QQ"
          renderValue={(items) => {
            return items.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <Avatar
                  alt={item.key?.toString()}
                  className="flex-shrink-0"
                  size="sm"
                  src={
                    isQQQuickNewItem(item.data)
                      ? item.data?.faceUrl
                      : `https://q1.qlogo.cn/g?b=qq&nk=${item.key}&s=1`
                  }
                />
                <div className="flex flex-col">
                  {isQQQuickNewItem(item.data)
                    ? `${item.data.nickName}(${item.key?.toString()})`
                    : item.key?.toString()}
                </div>
              </div>
            ))
          }}
          selectedKeys={[selectedQQ]}
          size="lg"
          onChange={handleSelectionChange}
        >
          {(item) => (
            <SelectItem key={item.uin} textValue={item.uin}>
              <div className="flex items-center gap-2">
                <Avatar
                  alt={item.uin}
                  className="flex-shrink-0"
                  size="sm"
                  src={
                    isQQQuickNewItem(item)
                      ? item.faceUrl
                      : `https://q1.qlogo.cn/g?b=qq&nk=${item.uin}&s=1`
                  }
                />
                <div className="flex flex-col">
                  {isQQQuickNewItem(item)
                    ? `${item.nickName}(${item.uin})`
                    : item.uin}
                </div>
              </div>
            </SelectItem>
          )}
        </Select>
        <Button
          isIconOnly
          className="flex-grow-0 flex-shrink-0"
          color="secondary"
          isLoading={refresh}
          radius="full"
          size="lg"
          variant="light"
          onPress={onUpdateQQList}
        >
          <IoMdRefresh size={24} />
        </Button>
      </div>
      <div className="flex justify-center mt-5">
        <Button
          className="w-64 max-w-full"
          color="primary"
          isLoading={isLoading}
          radius="full"
          size="lg"
          variant="shadow"
          onPress={onSubmit}
        >
          登录
        </Button>
      </div>
    </div>
  )
}

export default QuickLogin
