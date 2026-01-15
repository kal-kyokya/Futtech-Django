import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login';
import Navbar from '../components/Navbar';
import { renderWithProviders, seedAuthState } from './utils';
import { server } from './msw/server';
import tokenService from '../services/tokenService';

// Routes to verify navigation to /login after logout.
const TestRoutes = () => (
    <Routes>
	<Route path='/profile' element={<Navbar />} />
	<Route path='/login' element={<Login />} />
    </Routes>
);

describe('Logout', () => {
    it('clears local auth state even when logout endpoint fails', async () => {
	// Force logout endpoint failure to verify client cleanup behavior.
	server.use(
	    htpp.post('*/auth/logout/', async () => HttpResponse.json(
		{ message: 'Server error.' },
		{ status: 500 },
	    )),
	);

	const user = userEvent.setup();
	seedAuthState({
	    user: { id: 5, email: 'test@example.com', profilePic: '/blank.png' },
	    token: 'access-token',
	});

	renderWithProviders(<TestRoutes />, { route: '/profile', path: null });

	const logoutButtons = screen.getAllByText('Logout');
	await user.click(logoutButtons[0]);

	// verify UI notice and local auth storage cleared.
	expect(await screen.findByText('Logged out successfully.')).toBeInTheDocument();
	expect(tokenService.hasTokens()).toBe(false);
	expect(localStorage.getItem('user')).toBe('null');
    });
});
