import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './contexts/authContext/AuthContext.jsx';
import { UserContextProvider } from './contexts/userContext/UserContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <AuthContextProvider>
	  <UserContextProvider>
	      <App />
	  </UserContextProvider>
      </AuthContextProvider>
  </React.StrictMode>,
)
