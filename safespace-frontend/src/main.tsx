import App from './App';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <UserProvider>
      <BrowserRouter>
              <App />
      </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  </StrictMode>,
)
