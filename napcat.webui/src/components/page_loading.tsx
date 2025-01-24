import { Spinner } from '@heroui/spinner'
import clsx from 'clsx'

export interface PageLoadingProps {
  loading?: boolean
}
const PageLoading: React.FC<PageLoadingProps> = ({ loading }) => {
  return (
    <div
      className={clsx(
        'absolute top-0 left-0 w-full h-full bg-zinc-500 bg-opacity-10 z-50 flex justify-center items-center backdrop-blur',
        {
          hidden: !loading
        }
      )}
    >
      <Spinner size="lg" />
    </div>
  )
}

export default PageLoading
