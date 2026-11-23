import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import RouteError from '../components/routeError/RouteError';
import VideoPlayer from '../components/videoPlayer/VideoPlayer';
import NewPlaylist from '../pages/newPlaylist/NewPlaylist';
import Home from '../pages/home/Home';
import User from '../pages/user/User';
import { renderWithProviders, seedAuthState } from './utils';
import { server } from './msw/server';

describe('Frontend polish regressions', () => {

    it('preserves signed playback query parameters', () => {
	render(
	    <VideoPlayer
		embedUrl='https://iframe.mediadelivery.net/embed/lib/clip?token=signed-token&expires=123'
		title='Training clip'
	    />,
	);

	const url = new URL(screen.getByTitle('Training clip').src);
	expect(url.searchParams.get('token')).toBe('signed-token');
	expect(url.searchParams.get('expires')).toBe('123');
	expect(url.searchParams.get('loop')).toBe('true');
    });

    it('shows an explicit unavailable state instead of an empty player', () => {
	render(<VideoPlayer />);

	expect(
	    screen.getByText('Playback is not available for this video yet.'),
	).toBeInTheDocument();
    });

    it('creates playlists with the backend name field', async () => {
	seedAuthState({ user: { id: 1 }, token: 'access-token' });

	let payload;

	server.use(
	    http.post('*/playlists/', async ({ request }) => {
		payload = await request.json();
		return HttpResponse.json({ id: 1, ...payload }, { status: 201 });
	    }),
	);

	renderWithProviders(
	    <Routes>
		<Route path='/new-playlist' element={<NewPlaylist />} />
		<Route path='/playlists' element={<h1>My collections</h1>} />
	    </Routes>,
	    { route: '/new-playlist', path: null },
	);

	const user = userEvent.setup();
	await user.type(screen.getByLabelText('Playlist name'), 'Match review');
	await user.click(screen.getByRole('button', { name: 'Create playlist' }));
	expect(await screen.findByText('My collections')).toBeInTheDocument();
	expect(payload).toEqual({ name: 'Match review' });
    });

    it('finishes loading an empty home library without refetching indefinitely', async () => {
	let requests = 0;

	server.use(
	    http.get('*/playlists/', () => {
		requests += 1;
		return HttpResponse.json({ count: 0, next: null, results: [] });
	    }),
	);

	renderWithProviders(<Home />);

	expect(
	    await screen.findByText(/Your library is ready for a fresh perspective/),
	).toBeInTheDocument();
	await waitFor(() => expect(requests).toBe(1));
	expect(
	    screen.queryByText('Loading your playlists…'),
	).not.toBeInTheDocument();
    });

    it('recovers from render failures with a usable home link', () => {
	const Broken = () => {
	    throw new Error('Simulated render failure');
	};

	const errors = vi.spyOn(console, 'error').mockImplementation(() => {});

	try {
	    render(
		<RouteError>
		    <Broken />
		</RouteError>,
	    );

	    expect(
		screen.getByRole('heading', { name: 'Something went wrong' }),
	    ).toBeInTheDocument();
	    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute(
		'href',
		'/',
	    );
	} finally {
	    errors.mockRestore();
	}
    });

    it('associates profile validation feedback with the affected input', async () => {
	seedAuthState({
	    user: { id: 1, username: 'player' },
	    token: 'access-token',
	});

	server.use(
	    http.put('*/users/1/', () =>
		HttpResponse.json(
		    { username: ['This username is already in use.'] },
		    { status: 400 },
		),
	    ),
	);

	renderWithProviders(<User />);

	const user = userEvent.setup();
	const input = screen.getByLabelText('Username', { exact: true });
	await user.clear(input);
	await user.type(input, 'duplicate');
	await user.click(screen.getByRole('button', { name: 'Save changes' }));

	expect(
	    await screen.findByText('This username is already in use.'),
	).toBeInTheDocument();
	expect(input).toHaveAttribute('aria-invalid', 'true');
	expect(input).toHaveAccessibleDescription(
	    'This username is already in use.',
	);
    });
});
