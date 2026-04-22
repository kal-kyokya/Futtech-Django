import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import { server } from './msw/server';
import { renderWithProviders } from './utils';
import Showcase from '../pages/showcase/Showcase';

describe('Showcase page', () => {
    it('renders anonymous showcase videos from public endpoint', async () => {
	server.use(
	    http.get('*/public/showcase/', async () => HttpResponse.json([
		{
		    id: 'vid-1',
		    slug: 'admissions-highligh',
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
});
