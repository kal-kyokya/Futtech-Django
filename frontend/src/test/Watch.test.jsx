import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import { server } from './msw/server';
import { renderWithProviders } from './utils';
import Watch from '../pages/watch/Watch';

describe('Watch page', () => {
    it('loads video details and playback by slug', async () => {
	server.use(
	    http.get('*/video/jean-paul-highlight/', async () => HttpResponse.json({
		id: 'vid-1',
		slug: 'jean-paul-highlight',
		title: "Jean-Paul's Highlight",
		description: 'A private clip of the highlights of a player',
		is_premium: false,
	    }, { status: 200 })),
	    http.get('*/video/jean-paul-highlight/playback/', async () => HttpResponse.json({
		embed_url: 'https://example.com/embed/jean-paul-highlight',
		status: 'ready',
	    }, { status: 200 })),
	);

	renderWithProviders(<Watch />, { route: '/watch/jean-paul-highlight', path: '/watch:slug' });

	await waitFor(() => {
	    expect(screen.getByRole('heading', { name: 'Team Highligh' })).toBeInTheDocument();
	});

	expect(screen.getByText('A private clip of the highlights of a player')).toBeInTheDocument();
    });
});
