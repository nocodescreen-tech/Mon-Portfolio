import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Fallback FontAwesome — remplacé par lucide-react plus tard
import '@fortawesome/fontawesome-free/css/fontawesome.min.css'
import '@fortawesome/fontawesome-free/css/solid.min.css'
import '@fortawesome/fontawesome-free/css/brands.min.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
