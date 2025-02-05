import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import { Snippet } from '@heroui/snippet'

import { getResponseStatusColor, getResponseStatusText } from '@/utils/onebot'

import { RequestResponse } from '@/types/onebot'

export interface OneBotDisplayResponseProps {
  data: RequestResponse
}

const OneBotDisplayResponse: React.FC<OneBotDisplayResponseProps> = ({
  data
}) => {
  return (
    <div className="flex gap-2 items-center">
      <Chip color={getResponseStatusColor(data.status)} variant="flat">
        {getResponseStatusText(data.status)}
      </Chip>
      {data.data && (
        <Popover
          placement="right"
          showArrow
          classNames={{
            content: 'max-h-96 max-w-96 overflow-hidden p-0'
          }}
        >
          <PopoverTrigger>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              radius="full"
              className="text-medium"
            >
              查看数据
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Snippet
              hideSymbol
              tooltipProps={{
                content: '点击复制'
              }}
              classNames={{
                copyButton: 'self-start sticky top-0 right-0'
              }}
              className="bg-content1 h-full overflow-y-scroll items-start"
            >
              {JSON.stringify(data.data, null, 2)
                .split('\n')
                .map((line, i) => (
                  <span key={i} className="whitespace-pre-wrap break-all">
                    {line}
                  </span>
                ))}
            </Snippet>
          </PopoverContent>
        </Popover>
      )}
      {data.message && (
        <Chip className="pl-0.5" variant="flat">
          <Chip color="warning" size="sm" className="-ml-2 mr-1" variant="flat">
            返回消息
          </Chip>
          {data.message}
        </Chip>
      )}
    </div>
  )
}

export default OneBotDisplayResponse
