import ReactDOM from 'react-dom/client'
import 'react-photo-view/dist/react-photo-view.css'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App.tsx'
import { Provider } from '@/provider.tsx'
import '@/styles/globals.css'

import key from './const/key'
import WebUIManager from './controllers/webui_manager'
import { loadTheme } from './utils/theme'

WebUIManager.checkWebUiLogined()

const token = localStorage.getItem(key.token)
const theme = localStorage.getItem(key.theme)

// 兼容 useLocalStorage
if (token && !token.startsWith('"')) {
  localStorage.setItem(key.token, JSON.stringify(token))
}
if (theme && !theme.startsWith('"')) {
  localStorage.setItem(key.theme, JSON.stringify(theme))
}

loadTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <BrowserRouter basename="/webui/">
    <Provider>
      <App />
    </Provider>
  </BrowserRouter>
  // </React.StrictMode>
)
