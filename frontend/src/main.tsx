import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { BalanceProvider } from './balance/BalanceProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <BalanceProvider>
        <App />
      </BalanceProvider>
    </BrowserRouter>
  </StrictMode>,
)
