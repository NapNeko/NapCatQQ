import { Route, Routes } from 'react-router-dom'

import DefaultLayout from '@/layouts/default'

import DashboardIndexPage from './dashboard'
import AboutPage from './dashboard/about'
import ConfigPage from './dashboard/config'
import DebugPage from './dashboard/debug'
import HttpDebug from './dashboard/debug/http'
import WSDebug from './dashboard/debug/websocket'
import LogsPage from './dashboard/logs'
import NetworkPage from './dashboard/network'

export default function IndexPage() {
  return (
    <DefaultLayout>
      <Routes>
        <Route element={<DashboardIndexPage />} path="/" />
        <Route element={<NetworkPage />} path="/network" />
        <Route element={<ConfigPage />} path="/config" />
        <Route element={<LogsPage />} path="/logs" />
        <Route element={<DebugPage />} path="/debug">
          <Route path="ws" element={<WSDebug />} />
          <Route path="http" element={<HttpDebug />} />
        </Route>
        <Route element={<AboutPage />} path="/about" />
      </Routes>
    </DefaultLayout>
  )
}
