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

	renderWithProviders(<Watch />, { route: '/watch/jean-paul-highlight', path: '/watch/:slug' });

	await waitFor(() => {
	    expect(screen.getByRole('heading', { name: "Jean-Paul's Highlight" })).toBeInTheDocument();
	});

	expect(screen.getByText('A private clip of the highlights of a player')).toBeInTheDocument();
    });

    it('falls back to the playlist video id when the routed slug is not found', async () => {
	server.use(
	    http.get('*/video/stale-slug/', async () => HttpResponse.json({
		error: 'Video not found',
	    }, { status: 404 })),
	    http.get('*/video/stale-slug/playback/', async () => HttpResponse.json({
		error: 'Video not found',
	    }, { status: 404 })),
	    http.get('*/video/vid-1/', async () => HttpResponse.json({
		id: 'vid-1',
		slug: 'fresh-slug',
		title: 'Fresh Playlist Video',
		description: 'Loaded by id after the slug lookup missed',
		is_premium: false,
	    }, { status: 200 })),
	    http.get('*/video/vid-1/playback/', async () => HttpResponse.json({
		embed_url: 'https://example.com/embed/vid-1',
		status: 'ready',
	    }, { status: 200 })),
	);

	renderWithProviders(<Watch />, {
	    route: {
		pathname: '/watch/stale-slug',
		state: { video: { id: 'vid-1', slug: 'stale-slug' }, origin: 'playlist' },
	    },
	    path: '/watch/:slug',
	});

	await waitFor(() => {
	    expect(screen.getByRole('heading', { name: 'Fresh Playlist Video' })).toBeInTheDocument();
	});

	expect(screen.getByText('Loaded by id after the slug lookup missed')).toBeInTheDocument();
    });
});
