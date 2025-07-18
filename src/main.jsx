
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

// Initialisation de l'API (optionnel, si vous avez besoin de configurer quelque chose globalement)
// import { initializeApi } from '@/lib/api'; 
// initializeApi();


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
