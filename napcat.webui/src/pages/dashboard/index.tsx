import { button as buttonStyles } from '@nextui-org/theme'
import { Button } from '@nextui-org/button'

import useAuth from '@/hooks/auth'

const DashboardIndexPage: React.FC = () => {
  const { revokeAuth } = useAuth()
  const onTest = () => {
    revokeAuth()
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="flex gap-3">
        <Button
          className={buttonStyles({
            color: 'primary',
            radius: 'full',
            variant: 'shadow'
          })}
          onClick={onTest}
        >
          这个按钮会退出登录，慎点
        </Button>
      </div>
    </section>
  )
}

export default DashboardIndexPage
