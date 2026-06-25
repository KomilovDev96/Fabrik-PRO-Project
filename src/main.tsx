import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/shared/config/i18n' // initialize i18next before first render
import '@/app/styles/index.css'
import { App } from '@/app/App'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
