import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';

const completeGoogleScriptLoad = () => {
    window.google = {
	accounts: {
	    id: {
		initialize: vi.fn(),
		renderButton: vi.fn((container) => {
		    const button = document.createElement('button');
		    button.textContent = 'Sign in with Google';
		    container.appendChild(button);
		}),
	    },
	},
    };

    document.getElementById('google-identity-services').dispatchEvent(new Event('load'));
};

describe('GoogleSignInButton', () => {
    afterEach(() => {
	vi.unstubAllEnvs();
	delete window.google;
	document.getElementById('google-identity-services')?.remove();
    });

    it('loads the official Google Identity Services script and renders the button', async () => {
	const onSuccess = vi.fn();
	vi.stubEnv('VITE_GOOGLE_OAUTH_CLIENT_ID', 'test-client-id.apps.googleusercontent.com');

	render(<GoogleSignInButton onSuccess={onSuccess} />);

	const script = document.getElementById('google-identity-services');
	expect(script).toHaveAttribute('src', 'https://accounts.google.com/gsi/client');

	completeGoogleScriptLoad();

	await waitFor(() => {
	    expect(window.google.accounts.id.initialize).toHaveBeenCalledWith({
		client_id: 'test-client-id.apps.googleusercontent.com',
		callback: expect.any(Function),
	    });
	});
	expect(screen.getByRole('button', { name: /sign in with google/i })).toBeImTheDocument();
    });


    it('initializes Google Identity Services once for the same client id across rerenders', async () => {
	vi.stubEnv('VITE_GOOGLE_OAUTH_CLIENT_ID', 'test-client-id.apps.googleusercontent.com');

	const { rerender } = render(<GoogleSignInButton onSuccess={vi.fn()} text='signin_with' />);
	completeGoogleScriptLoad();

	await waitFor(() => {
	    expect(window.google.accounts.id.initialize).toHaveBeenCalledTimes(1);
	});

	rerender(<GoogleSignInButton onSuccess={vi.fn()} text='continue_with' />);

	await waitFor(() => {
	    expect(window.google.accounts.id.renderButton).toHaveBeenCalledTimes(2);
	});
	expect(window.google.accounts.id.initialize).toHaveBeenCalledTimes(1);
    });

    it('does not show the cancellation message when the script fails to load', async () => {
	const onError = vi.fn();
	vi.stubEnv('VITE_GOOGLE_OAUTH_CLIENT_ID', 'test-client-id.apps.googleusercontent.com');

	render(<GoogleSignInButton onSuccess={vi.fn()} onError={onError} />);
	document.getElementById('google-identity-services').dispatchEvent(new Event('error'));

	expect(await screen.findByText('Google Sign-In is currently unavailable.')).toBeInTheDocument();
	expect(onError).toHaveBeenCalledWith({ silent: true });
    });
});
