import { Spinner } from '@heroui/spinner'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import DefaultLayout from '@/layouts/default'

export default function IndexPage() {
  const location = useLocation()

  return (
    <DefaultLayout>
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
