import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, delay, http } from 'msw';
import { Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import Login from '../pages/login/Login';
import { renderWithProviders } from './utils';
import { server } from './msw/server';
import { UserContext } from '../contexts/userContext/UserContext';
import tokenService from '../services/tokenService';

// Minimal home page stub to confirm login success.
const HomeStub = () => {
    const { user } = useContext(UserContext);
    return <div>Welcome {user?.email}</div>;
};

// Routes needed for navigating away from '/login' on success.
const TestRoutes = () => (
    <Routes>
	<Route path='/login' element={<Login />} />
	<Route path='/' element={<HomeStub />} />
    </Routes>
);

describe('Login', () => {
    it('shows invalid credentials message on 401 and stays logged out',
       async () => {
	   // Simulate backend 401 with a human-readable error.
	   server.use(
	       http.post('*/auth/login/', async () => {
		   await delay(50);
		   return HttpResponse.json(
		       { detail: 'Invalid credentials.' },
		       { status: 401 },
		   );
	       }),
	   );

	   const user = userEvent.setup();
	   renderWithProviders(<TestRoutes />, { route: '/login', path: null });

	   await user.type(screen.getByPlaceholderText('Email address'), 'bad@example.com');
	   await user.type(screen.getByPlaceholderText('Password'), 'wrongpass');

	   const submitButton = screen.getByRole('button', { name: /sign in/i });
	   await user.click(submitButton);

	   await waitFor(() => {
	       expect(submitButton).toBeDisabled();
	   });

	   // Assert user-visible error and still on login page.
	   expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
	   expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
       });

    it('shows server message on 500 responses', async () => {
	// Simulate backend error for generic fallback message.
	server.use(
	    http.post('*/auth/login/', async () => HttpResponse.json(
		{ message: 'Server error. Please try again.' },
		{ status: 500 },
	    )),
	);

	const user = userEvent.setup();
	renderWithProviders(<TestRoutes />, { route: '/login', path: null });

	await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com');
	await user.type(screen.getByPlaceholderText('Password'), 'Password123!');
	await user.click(screen.getByRole('button', { name: /sign in/i }));

	// Surface the server-provided message to the UI.
	expect(await screen.findByText('Server error. Please try again.')).toBeInTheDocument();
    });

    it('stores access token and shows user after successful login',
       async () => {
	   // Happy-path login should populate token storage and render a welcome state.
	   const user = userEvent.setup();
	   renderWithProviders(<TestRoutes />, { route: '/login', path: null });

	   await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com');
	   await user.type(screen.getByPlaceholderText('Password'), 'Password123!');
	   await user.click(screen.getByRole('button', { name: /sign in/i }));

	   expect(await screen.findByText('Welcome test@example.com')).toBeInTheDocument();
	   expect(tokenService.hasTokens()).toBe(true);
       });
});
