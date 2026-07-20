import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/theme.css'
import '@/styles/global.css'
import App from './App.tsx'

// Every page is React.lazy-loaded, so its chunk is fetched by filename+hash
// only when the user navigates there. A redeploy replaces those files, so a
// tab left open (or a cached page) from before the redeploy 404s on
// navigation with no way to recover — reload once to pick up the new build.
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
