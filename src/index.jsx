import React from 'react';
import ReactDOM from 'react-dom/client';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import App from './App';
import './index.css';
import toast from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();

const broadcastChannel = new BroadcastChannel('sw-messages');

// Listen to messages from service worker
broadcastChannel.onmessage = (evt) => {
  if (evt.data.action === 'skipWaiting') {
    toast((t) => (
      <span>
        Update available!
        <button style={{
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
          color: 'orange',
          background: 'transparent',
          marginLeft: '10px',
        }} onClick={() => {toast.dismiss(t.id); broadcastChannel.postMessage({ action: 'update'}); window.location.reload()}}>
          Reload
        </button>
      </span>
    ), {
      position: 'bottom-center',
      duration: Infinity,
      style: {
        color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
        background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
      }
    });
  }
}