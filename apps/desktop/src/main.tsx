import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useJarvisStore } from './store/useJarvisStore'

// Initialize the store and connect to the server
useJarvisStore.getState().connect()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
