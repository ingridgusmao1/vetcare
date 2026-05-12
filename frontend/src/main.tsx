import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import the global CSS once at the entry point — every component inherits it.
import './styles/global.css';

// React 18 createRoot API. The "!" tells TS we know the element exists in index.html.
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode: extra checks in dev (double-renders to catch side-effect bugs).
  // Stripped from production by React itself — no runtime cost.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);