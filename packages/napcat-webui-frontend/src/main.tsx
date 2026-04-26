import ReactDOM from 'react-dom/client';
import 'react-photo-view/dist/react-photo-view.css';
import { BrowserRouter } from 'react-router-dom';

import App from '@/App.tsx';
import { Provider } from '@/provider.tsx';
import '@/styles/globals.css';

import key from './const/key';
import WebUIManager from './controllers/webui_manager';
import { initFont, loadTheme } from './utils/theme';

WebUIManager.checkWebUiLogined();

const token = localStorage.getItem(key.token);
const theme = localStorage.getItem(key.theme);

// 兼容 useLocalStorage
if (token && !token.startsWith('"')) {
  localStorage.setItem(key.token, JSON.stringify(token));
}
if (theme && !theme.startsWith('"')) {
  localStorage.setItem(key.theme, JSON.stringify(theme));
}

loadTheme();
initFont();

// 支持自定义 URL 前缀（Feature 1）：服务端会向 HTML 注入 window.__NAPCAT_PREFIX__
const napCatPrefix = window.__NAPCAT_PREFIX__ || '';
const routerBase = napCatPrefix ? `${napCatPrefix}/webui/` : '/webui/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <BrowserRouter basename={routerBase}>
    <Provider>
      <App />
    </Provider>
  </BrowserRouter>
  // </React.StrictMode>
);

if (!import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // 当设置了自定义前缀时，使用前缀路径下的 sw.js；否则使用默认路径
      const swScope = napCatPrefix ? `${napCatPrefix}/webui/` : import.meta.env.BASE_URL;
      const swUrl = napCatPrefix ? `${napCatPrefix}/webui/sw.js` : `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker.register(swUrl, { scope: swScope })
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
