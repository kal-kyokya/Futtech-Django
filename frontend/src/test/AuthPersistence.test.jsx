import { screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { HttpResponse, http } from 'msw';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from '../pages/login/Login';
import authService from '../services/authService';
import tokenService from '../services/tokenService';
import { renderWithProviders, seedAuthState } from './utils';
import { server } from './msw/server';

// Minimal gate to exercise /me behavior without extra dependecies
const CurrentUserGate = () => {
    const [status, setStatus] = useState('loading');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
	// '/me' fetch simulates restoring a session on page load.
	const loadUser = async () => {
	    const result = await authService.getCurrentUser();

	    if (!result) {
		// Force logout if the session is invalid.
		tokenService.clearAccessToken();
		setStatus('unauthorized');
		navigate('/login', { replace: true });
		return
	    }

	    setUser(result);
	    setStatus('ready');
	};

	loadUser();
    }, [navigate]);

    if (status === 'loading') {
	return <div>Loading session...</div>;
    }

    if (status === 'unauthorized') {
	return <div>Redirecting to login...</div>;
    }

    return <div>Welcome {user.email}</div>;
};

// Routes include both the session gate and login page.
const TestRoutes = () => (
    <Routes>
	<Route path='/' element={<CurrentUserGate />} />
	<Route path='/login' element={<Login />} />
    </Routes>
);

describe('Auth persistence and /me', () => {
    it('shows current user after /me succeeds', async () => {
	// Seed an access token to simulate a returning user.
	seedAuthState({
	    user: { id: 1, email: 'test@example.com' },
	    token: 'access-token',
	});

	renderWithProviders(<TestRoutes />, { route: '/', path: null });

	expect(await screen.findByText('Welcome test@example.com')).toBeInTheDocument();
    });

    it('clears token and redirects to login on /me 401', async () => {
	// Simulate an expired session from the backend.
	server.use(
	    http.get('*/auth/me', async () => HttpResponse.json(
		{ detail: 'Unauthorized' },
		{ status: 401 },
	    )),
	);

	seedAuthState({
	    user: { id: 1, email: 'test@example.com' },
	    token: 'access-token',
	});

	renderWithProviders(<TestRoutes />, { route: '/', path: null });

	// Login page should be visible and token cleared after redirect.
	expect(await screen.findByTest('Sign In')).toBeInTheDocument();
	expect(tokenService.hasTokens()).toBe(false);
	expect(localStorage.getItem('user')).toBe('null');
    });
});
