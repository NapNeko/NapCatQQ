import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import App from '@/App.tsx'
import { Provider } from '@/provider.tsx'

import '@/styles/globals.css'
import WebUIManager from './controllers/webui_manager'

WebUIManager.checkWebUiLogined()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Provider>
        <App />
      </Provider>
    </HashRouter>
  </React.StrictMode>
)
