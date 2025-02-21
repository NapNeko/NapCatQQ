import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/tooltip'
import { LiaHandScissors } from 'react-icons/lia'

import useShowStructuredMessage from '@/hooks/use_show_strcuted_message'

const RPSInsert = () => {
  const showStructuredMessage = useShowStructuredMessage()

  return (
    <Tooltip content="发送猜拳">
      <Button
        color="primary"
        variant="flat"
        isIconOnly
        radius="full"
        onPress={() => {
          showStructuredMessage([
            {
              type: 'rps'
            }
          ])
        }}
      >
        <LiaHandScissors className="text-2xl" />
      </Button>
    </Tooltip>
  )
}

export default RPSInsert
