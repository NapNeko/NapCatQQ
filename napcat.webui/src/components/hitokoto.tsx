import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/tooltip'
import { useRequest } from 'ahooks'
import toast from 'react-hot-toast'
import { IoCopy, IoRefresh } from 'react-icons/io5'

import { request } from '@/utils/request'

import PageLoading from './page_loading'

export default function Hitokoto() {
  const {
    data: dataOri,
    error,
    loading,
    run
  } = useRequest(() => request.get<IHitokoto>('https://hitokoto.152710.xyz/'), {
    pollingInterval: 10000,
    throttleWait: 1000
  })
  const data = dataOri?.data
  const onCopy = () => {
    try {
      const text = `${data?.hitokoto} —— ${data?.from} ${data?.from_who}`
      navigator.clipboard.writeText(text)
      toast.success('复制成功')
    } catch (error) {
      toast.error('复制失败, 请手动复制')
    }
  }
  return (
    <div>
      <div className="relative">
        {loading && <PageLoading />}
        {error ? (
          <div className="text-primary-400">一言加载失败：{error.message}</div>
        ) : (
          <>
            <div>{data?.hitokoto}</div>
            <div className="text-right">
              —— <span className="text-default-400">{data?.from}</span>{' '}
              {data?.from_who}
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <Tooltip content="刷新" placement="top">
          <Button
            onPress={run}
            size="sm"
            isLoading={loading}
            isIconOnly
            radius="full"
            color="primary"
            variant="flat"
          >
            <IoRefresh />
          </Button>
        </Tooltip>
        <Tooltip content="复制" placement="top">
          <Button
            onPress={onCopy}
            size="sm"
            isIconOnly
            radius="full"
            color="success"
            variant="flat"
          >
            <IoCopy />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
