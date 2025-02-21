import { Suspense, lazy, useEffect } from 'react'
import { Provider } from 'react-redux'
import { Route, Routes, useNavigate } from 'react-router-dom'

import PageBackground from '@/components/page_background'
import PageLoading from '@/components/page_loading'
import Toaster from '@/components/toaster'

import DialogProvider from '@/contexts/dialog'
import AudioProvider from '@/contexts/songs'

import useAuth from '@/hooks/auth'

import store from '@/store'

const WebLoginPage = lazy(() => import('@/pages/web_login'))
const IndexPage = lazy(() => import('@/pages/index'))
const QQLoginPage = lazy(() => import('@/pages/qq_login'))
const DashboardIndexPage = lazy(() => import('@/pages/dashboard'))
const AboutPage = lazy(() => import('@/pages/dashboard/about'))
const ConfigPage = lazy(() => import('@/pages/dashboard/config'))
const DebugPage = lazy(() => import('@/pages/dashboard/debug'))
const HttpDebug = lazy(() => import('@/pages/dashboard/debug/http'))
const WSDebug = lazy(() => import('@/pages/dashboard/debug/websocket'))
const FileManagerPage = lazy(() => import('@/pages/dashboard/file_manager'))
const LogsPage = lazy(() => import('@/pages/dashboard/logs'))
const NetworkPage = lazy(() => import('@/pages/dashboard/network'))
const TerminalPage = lazy(() => import('@/pages/dashboard/terminal'))

function App() {
  return (
    <DialogProvider>
      <Provider store={store}>
        <PageBackground />
        <Toaster />
        <AudioProvider>
          <Suspense fallback={<PageLoading />}>
            <AuthChecker>
              <AppRoutes />
            </AuthChecker>
          </Suspense>
        </AudioProvider>
      </Provider>
    </DialogProvider>
  )
}

function AuthChecker({ children }: { children: React.ReactNode }) {
  const { isAuth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuth) {
      const search = new URLSearchParams(window.location.search)
      const token = search.get('token')
      let url = '/web_login'

      if (token) {
        url += `?token=${token}`
      }
      navigate(url, { replace: true })
    }
  }, [isAuth, navigate])

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />}>
        <Route index element={<DashboardIndexPage />} />
        <Route path="network" element={<NetworkPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="debug" element={<DebugPage />}>
          <Route path="ws" element={<WSDebug />} />
          <Route path="http" element={<HttpDebug />} />
        </Route>
        <Route path="file_manager" element={<FileManagerPage />} />
        <Route path="terminal" element={<TerminalPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
      <Route path="/qq_login" element={<QQLoginPage />} />
      <Route path="/web_login" element={<WebLoginPage />} />
    </Routes>
  )
}

export default App
