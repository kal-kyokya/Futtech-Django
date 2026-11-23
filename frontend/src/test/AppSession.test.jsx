import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { AuthContextProvider } from '../contexts/authContext/AuthContext';
import { UserContextProvider } from '../contexts/userContext/UserContext';
import { VideoContextProvider } from '../contexts/videoContext/VideoContext';
import { PlaylistContextProvider } from '../contexts/playlistContext/PlaylistContext';
import { server } from './msw/server';
import tokenService from '../services/tokenService';

const mountApp = () =>
      render(
	  <AuthContextProvider>
	      <UserContextProvider>
		  <VideoContextProvider>
		      <PlaylistContextProvider>
			  <App />
		      </PlaylistContextProvider>
		  </VideoContextProvider>
	      </UserContextProvider>
	  </AuthContextProvider>,
      );

describe('Application session initialization', () => {

    afterEach(() => window.history.replaceState({}, '', '/'));

    it('restores a cookie session before rendering a protected route', async () => {
	window.history.replaceState({}, '', '/profile');
	mountApp();
	expect(
	    await screen.findByRole('heading', { name: 'Profile' }),
	).toBeInTheDocument();
	expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
	expect(tokenService.hasTokens()).toBe(true);
	expect(localStorage.getItem('futtech_access_token')).toBeNull();
    });

    it('renders login when restoration fails without blocking the app shell', async () => {
	window.history.replaceState({}, '', '/login');
	server.use(
	    http.post('*/auth/token/refresh/', () =>
		HttpResponse.json({}, { status: 401 }),
	    ),
	);
	mountApp();
	expect(
	    await screen.findByRole('button', { name: 'Sign In' }),
	).toBeInTheDocument();
	expect(tokenService.hasTokens()).toBe(false);
    });
});
