import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from './msw/server';
import { renderWithProviders } from './utils';
import Showcase from '../pages/showcase/Showcase';
import PublicHeader from '../components/publicHeader/PublicHeader';

describe('Showcase page', () => {
    it('renders anonymous showcase videos from public endpoint', async () => {
	server.use(
	    http.get('*/public/showcase/', async () => HttpResponse.json([
		{
		    id: 'vid-1',
		    slug: 'admissions-highlight',
		    title: 'Admissions Highlight',
		    description: 'Public clip for reviewers',
		    thumbnail: '',
		    embed_url: 'https://example.com/embed',
		},
	    ], { status: 200 })),
	);

	renderWithProviders(<Showcase />, { route: '/showcase', path: '/showcase' });

	await waitFor(() => {
	    expect(screen.getByText('Admissions Highlight')).toBeInTheDocument();
	});

	expect(screen.getByText('Public Showcase · No account needed')).toBeInTheDocument();
    });

    it('toggles the public navigation menu without navigating', async () => {
	const user = userEvent.setup();
	renderWithProviders(<PublicHeader />, { route: '/showcase', path: '/showcase' });

	const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
	expect(menuButton).toHaveAttribute('aria-expanded', 'false');

	await user.click(menuButton);
	expect(menuButton).toHaveAttribute('aria-expanded', 'true');
	expect(document.getElementById('navigation')).toHaveClass('active');

	await user.click(menuButton);
	expect(menuButton).toHaveAttribute('aria-expanded', 'false');
	expect(document.getElementById('navigation')).not.toHaveClass('active');
    });
});
