import { Button } from '@heroui/button'
import { Code } from '@heroui/code'
import { MdError } from 'react-icons/md'

export interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}
function errorFallbackRender({
  error,
  resetErrorBoundary
}: ErrorFallbackProps) {
  return (
    <div className="pt-32 flex flex-col justify-center items-center">
      <div className="flex items-center">
        <MdError className="mr-2" color="red" size={30} />
        <h1 className="text-2xl">出错了</h1>
      </div>
      <div className="my-6 flex flex-col justify-center items-center">
        <p className="mb-2">错误信息</p>
        <Code>{error.message}</Code>
      </div>
      <Button color="primary" size="md" onPress={resetErrorBoundary}>
        重试
      </Button>
    </div>
  )
}

export default errorFallbackRender
