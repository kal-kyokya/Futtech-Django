import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './contexts/authContext/AuthContext';
import { VideoContextProvider } from './contexts/videoContext/VideoContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
	<AuthContextProvider>
	    <VideoContextProvider>
		<App />
	    </VideoContextProvider>
	</AuthContextProvider>
    </React.StrictMode>,
)
