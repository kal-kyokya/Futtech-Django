import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContextProvider } from '../contexts/authContext/AuthContext';
import { UserContextProvider } from '../contexts/userContext/UserContext';
import { VideoContextProvider } from '../contexts/videoContext/VideoContext';
import { ListContextProvider } from '../contexts/listContext/ListContext';
import tokenService from '../services/tokenService';

// Seed localStorage + tokenService to simulate authenticated users.
export const seedAuthState = ({ user, token }) => {
    if (user) {
	localStorage.setItem('user', JSON.stringify(user));
    }

    if (token) {
	tokenService.setAccessToken(token);
    }
};

// Render helper that mirrors app-level providers and routing.
export const renderWithProviders = (
    ui,
    {
	route = '/',
	path = '/',
    } = {},
) => {
    const content = path
	  ? (
	      <Routes>
		  <Route path={path} element={ui} />
	      </Routes>
	  )
	  : ui;

    return render(
	<MemoryRouter initialEntries={[route]}>
	    <AuthContextProvider>
		<UserContextProvider>
		    <VideoContextProvider>
			<ListContextProvider>
			    {/* Allow rendering either a single route or full route tree. */}
			    {content}
			</ListContextProvider>
		    </VideoContextProvider>
		</UserContextProvider>
	    </AuthContextProvider>
	</MemoryRouter>,
    );
};
