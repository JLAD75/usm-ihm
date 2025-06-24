import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const splash = document.getElementById('splash-screen');
if (splash) splash.style.opacity = '0';
setTimeout(() => splash && splash.remove(), 400);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
