import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
// import './styles/lovable.css'
import App from './app/App'

// StrictMode membantu mendeteksi bug di development
// Di production tidak berpengaruh pada performa
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
