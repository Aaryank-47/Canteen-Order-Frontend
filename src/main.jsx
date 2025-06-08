import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="933031359598-bc87ugtilu1bh464ap0tn66b8l7nrm0j.apps.googleusercontent.com">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>;
  </StrictMode>,
)

{/* <GoogleOAuthProvider clientId="113373390210-s6dqhs50dfqateg8vidagfv3nqs8j974.apps.googleusercontent.com"> */ }