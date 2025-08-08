import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Enhanced error handling
const handleError = (error, errorInfo) => {
  console.error('React Error:', error, errorInfo);
};

// Create root with error boundary
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)