import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './contexts/authContext/AuthContext';
import { VideoContextProvider } from './contexts/videoContext/VideoContext';
import { ListContextProvider } from './contexts/listContext/ListContext';
import { UserContextProvider } from './contexts/userContext/UserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
	<AuthContextProvider>
	    <VideoContextProvider>
		<ListContextProvider>
		    <UserContextProvider>
			<App />
		    </UserContextProvider>
		</ListContextProvider>
	    </VideoContextProvider>
	</AuthContextProvider>
    </React.StrictMode>,
)
