import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PharmacyProvider } from './context/PharmacyContext.tsx'
import { TicketProvider } from './context/TicketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PharmacyProvider>
      <TicketProvider>
        <App />
      </TicketProvider>
    </PharmacyProvider>
  </StrictMode>,
)

