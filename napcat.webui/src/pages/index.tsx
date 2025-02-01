import { AnimatePresence, motion } from 'motion/react'
import { Route, Routes, useLocation } from 'react-router-dom'

import UnderConstruction from '@/components/under_construction'

import DefaultLayout from '@/layouts/default'

import DashboardIndexPage from './dashboard'
import AboutPage from './dashboard/about'
import ConfigPage from './dashboard/config'
import DebugPage from './dashboard/debug'
import HttpDebug from './dashboard/debug/http'
import WSDebug from './dashboard/debug/websocket'
import LogsPage from './dashboard/logs'
import NetworkPage from './dashboard/network'
import TerminalPage from './dashboard/terminal'

export default function IndexPage() {
  const location = useLocation()
  return (
    <DefaultLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location} key={location.pathname}>
            <Route element={<DashboardIndexPage />} path="/" />
            <Route element={<NetworkPage />} path="/network" />
            <Route element={<ConfigPage />} path="/config" />
            <Route element={<LogsPage />} path="/logs" />
            <Route element={<DebugPage />} path="/debug">
              <Route path="ws" element={<WSDebug />} />
              <Route path="http" element={<HttpDebug />} />
            </Route>
            <Route element={<UnderConstruction />} path="/file_manager" />
            <Route element={<TerminalPage />} path="/terminal" />
            <Route element={<AboutPage />} path="/about" />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </DefaultLayout>
  )
}
