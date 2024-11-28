import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import App from '@/App.tsx'
import { Provider } from '@/provider.tsx'

import '@/styles/globals.css'
import WebUIManager from './controllers/webui_manager'

WebUIManager.checkWebUiLogined()

const token = localStorage.getItem('token')
const theme = localStorage.getItem('theme')

// 兼容 useLocalStorage
if (token && !token.startsWith('"')) {
  localStorage.setItem('token', JSON.stringify(token))
}
if (theme && !theme.startsWith('"')) {
  localStorage.setItem('theme', JSON.stringify(theme))
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Provider>
        <App />
      </Provider>
    </HashRouter>
  </React.StrictMode>
)
