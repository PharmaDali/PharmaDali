import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PharmacyProvider } from './context/PharmacyContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PharmacyProvider>
      <App />
    </PharmacyProvider>
  </StrictMode>,
)

