import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import 'styles/tokens.css';
import 'styles/index.css';
import '@fontsource-variable/inter';
import { rootStore } from 'stores/RootStore';

import App from './App.tsx';
import { router } from './router';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Корневой элемент #root не найден в index.html');
}

rootStore.queryParams.attach(router);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
