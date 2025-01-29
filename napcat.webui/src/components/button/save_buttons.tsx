import { Button } from '@heroui/button'
import toast from 'react-hot-toast'
import { IoMdRefresh } from 'react-icons/io'

export interface SaveButtonsProps {
  onSubmit: () => void
  reset: () => void
  refresh?: () => void
  isSubmitting: boolean
}

const SaveButtons: React.FC<SaveButtonsProps> = ({
  onSubmit,
  reset,
  isSubmitting,
  refresh
}) => (
  <div className="max-w-full mx-3 w-96 flex flex-col justify-center gap-3">
    <div className="flex items-center justify-center gap-2 mt-5">
      <Button
        color="default"
        onPress={() => {
          reset()
          toast.success('重置成功')
        }}
      >
        取消更改
      </Button>
      <Button
        color="danger"
        isLoading={isSubmitting}
        onPress={() => onSubmit()}
      >
        保存
      </Button>
      {refresh && (
        <Button
          isIconOnly
          color="secondary"
          radius="full"
          variant="flat"
          onPress={() => refresh()}
        >
          <IoMdRefresh size={24} />
        </Button>
      )}
    </div>
  </div>
)

export default SaveButtons
