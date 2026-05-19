import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Bootstrap CSS (must come before our custom CSS)
import 'bootstrap/dist/css/bootstrap.min.css'

// Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'

// Bootstrap JavaScript bundle (for modals, dropdowns, tooltips, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Toast notifications
import 'react-toastify/dist/ReactToastify.css'

// Our custom global CSS (loaded LAST so we can override Bootstrap)
import './index.css'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

// Remove any dark-mode state left from previous sessions
document.documentElement.removeAttribute('data-ax-theme');
localStorage.removeItem('ax_theme');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
