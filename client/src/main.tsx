import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import './index.css';
import './styles/footer.css';

const rootEl = document.getElementById('root')!;
const boot = document.getElementById('hai-boot');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);

// Splash removal is handled in App.tsx to sync with auth state
