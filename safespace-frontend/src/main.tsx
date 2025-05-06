import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
// import { Provider } from 'react-redux';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <UserProvider>
      <BrowserRouter>
            {/* <Provider store={store}> */}
              <App />
            {/* </Provider> */}
      </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  </StrictMode>,
)
