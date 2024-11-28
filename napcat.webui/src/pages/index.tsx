import { Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import DashboardIndexPage from './dashboard'
import AboutPage from './dashboard/about'
import NetworkPage from './dashboard/network'
import ConfigPage from './dashboard/config'
import LogsPage from './dashboard/logs'

import useAuth from '@/hooks/auth'
import DefaultLayout from '@/layouts/default'

export default function IndexPage() {
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
      navigate(url)
    }
  }, [isAuth, navigate])

  return (
    <DefaultLayout>
      <Routes>
        <Route element={<DashboardIndexPage />} path="/" />
        <Route element={<NetworkPage />} path="/network" />
        <Route element={<ConfigPage />} path="/config" />
        <Route element={<LogsPage />} path="/logs" />
        <Route element={<AboutPage />} path="/about" />
      </Routes>
    </DefaultLayout>
  )
}
