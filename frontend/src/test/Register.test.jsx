import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, delay, http } from 'msw';
import Register from '../pages/register/Register';
import { renderWithProviders } from './utils';
import { server } from './msw/server';

// Helper to move from email/username step into password step.
const goToPasswordStep = async (user) => {
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Username'), 'tester');
    await user.click(screen.getByRole('button', { name: /get started/i }));
};

describe('Registration', () => {
    it('shows email already used field error on 400', async () => {
	// Override the default handler to simulate field errors.
	server.use(
	    http.post('*/auth/register/', async () => {
		await delay(50);
		return HttpResponse.json(
		    {
			message: 'Email already used.',
			email: ['Email already used'],
		    },
		    { status: 400 },
		);
	    }),
	);

	const user = userEvent.setup();
	renderWithProviders(<Register />, { route: '/register', path: '/register' });

	await goToPasswordStep(user);
	await user.type(screen.getByPlaceholderText('Password'), 'Password123!');
	await user.type(screen.getByPlaceholderText('Confirm password'), 'Password123!');
	await user.click(screen.getByRole('button', { name: /start/i }));

	// Field-specific errors should appear in the UI.
	expect(await screen.findByText('Email already used.')).toBeInTheDocument();
    });

    it('shows password too short field error on 400 and disables submit while pending', async () => {
	// Delay response to assert the loading/disabled state.
	server.use(
	    http.post('*/auth/register/', async () => {
		await delay(150);
		return HttpResponse.json(
		    {
			message: 'Password too short.',
			password: ['Password too short.'],
		    },
		    { status: 400 }
		);
	    }),
	);

	const user = userEvent.setup();
	renderWithProviders(<Register />, { route: '/register', path: '/register' });

	await goToPasswordStep(user);
	await user.type(screen.getByPlaceholderText('Password'), 'short');
	await user.type(screen.getByPlaceholderText('Confirm password'), 'short');

	const submitButton = screen.getByRole('button', { name: /start/i });
	await user.click(submitButton);

	await waitFor(() => {
	    expect(submitButton).toBeDisabled();
	});

	// Password field error should be surfaced to the user.
	expect(await screen.findByText('Password too short.')).toBeInTheDocument();
    });

    it('renders non-field error banner on 400', async () => {
	// Simulate a backend response with non-field erroros.
	server.use(
	    http.post('*/auth/register', async () => HttpResponse.json(
		{
		    message: 'Registration failed.',
		    non_field_errors: ['Registration failed.'],
		},
		{ status: 400 },
	    )),
	);

	const user = userEvent.setup();
	renderWithProviders(<Register />, { route: '/register', path: '/register' });

	await goToPasswordStep(user);
	await user.type(screen.getByPlaceholderText('Password'), 'Password123!');
	await user.type(screen.getByPlaceholderText('Confirm password'), 'Password123!');
	await user.click(screen.getByRole('button', { name: /start/i }));

	// The general error banner should display the server message.
	expect(await screen.findByText('Registration failed.')).toBeInTheDocument();
    });
});
