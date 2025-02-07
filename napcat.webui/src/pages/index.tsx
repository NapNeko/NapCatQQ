import { Spinner } from '@heroui/spinner'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import useAuth from '@/hooks/auth'
import useDialog from '@/hooks/use-dialog'

import WebUIManager from '@/controllers/webui_manager'
import DefaultLayout from '@/layouts/default'

const CheckDefaultPassword = () => {
  const { isAuth } = useAuth()
  const dialog = useDialog()
  const navigate = useNavigate()
  const checkDefaultPassword = async () => {
    const data = await WebUIManager.checkUsingDefaultToken()
    if (data) {
      dialog.confirm({
        title: '修改默认密码',
        content: '检测到当前密码为默认密码，请尽快修改密码。',
        confirmText: '前往修改',
        onConfirm: () => {
          navigate('/config?tab=token')
        }
      })
    }
  }

  useEffect(() => {
    if (isAuth) {
      checkDefaultPassword()
    }
  }, [isAuth])
  return null
}

export default function IndexPage() {
  const location = useLocation()

  return (
    <DefaultLayout>
      <CheckDefaultPassword />
      <Suspense
        fallback={
          <div className="flex justify-center px-10">
            <Spinner />
          </div>
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'tween',
              ease: 'easeInOut'
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </DefaultLayout>
  )
}
