import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './contexts/authContext/AuthContext.jsx';
import { UserContextProvider } from './contexts/userContext/UserContext.jsx';
import { VideoContextProvider } from './contexts/videoContext/VideoContext.jsx';
import { PlaylistContextProvider } from './contexts/playlistContext/PlaylistContext.jsx';
import { BrandingProvider } from './contexts/BrandingContext.tsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
	<BrandingProvider>
	    <AuthContextProvider>
		<UserContextProvider>
		    <VideoContextProvider>
			<PlaylistContextProvider>
			    <App />
			</PlaylistContextProvider>
		    </VideoContextProvider>
		</UserContextProvider>
	    </AuthContextProvider>
	</BrandingProvider>
    </React.StrictMode>,
)
