import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import VideoPlayer from '../components/videoPlayer/VideoPlayer';
import NewPlaylist from '../pages/newPlaylist/NewPlaylist';
import Home from '../pages/home/Home';
import PlaylistItem from '../components/playlistItem/PlaylistItem';
import { VideoContext } from '../contexts/videoContext/VideoContext';
import contentService from '../services/contentService';
import { renderWithProviders, seedAuthState } from './utils';
import { server } from './msw/server';

describe('Original design with retained functional fixes', () => {
    it('resolves numeric video identifiers in the original playlist cards', () => {
	renderWithProviders(
	    <VideoContext.Provider
		value={{ videos: [{ id: 7, slug: 'training', title: 'Training' }] }}
	    >
		<PlaylistItem videoId='7' index={0} />
	    </VideoContext.Provider>,
	);
	expect(
	    screen.getByRole('link', { name: 'Watch Training' }),
	).toHaveAttribute('href', '/watch/training');
    });

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

    it('creates playlists from the original form using the backend name field and clears cached lists', async () => {
	seedAuthState({ user: { id: 1 }, token: 'access-token' });
	let payload;
	server.use(
	    http.post('*/playlists/', async ({ request }) => {
		payload = await request.json();
		return HttpResponse.json({ id: 1, ...payload }, { status: 201 });
	    }),
	);
	contentService.cache.set('playlists_1_10', { playlists: [] });
	renderWithProviders(
	    <Routes>
		<Route path='/new-playlist' element={<NewPlaylist />} />
		<Route path='/playlists' element={<h1>My collections</h1>} />
	    </Routes>,
	    { route: '/new-playlist', path: null },
	);
	const user = userEvent.setup();
	await user.type(
	    screen.getByPlaceholderText('Playlist title'),
	    'Match review',
	);
	await user.click(
	    screen.getByRole('button', { name: 'Create', exact: true }),
	);
	expect(await screen.findByText('My collections')).toBeInTheDocument();
	expect(payload).toEqual({ name: 'Match review' });
	expect(contentService.cache.size).toBe(0);
    });

    it('loads playlists once and renders the original featured banner and carousel', async () => {
	let requests = 0;
	server.use(
	    http.get('*/playlists/', () => {
		requests += 1;
		return HttpResponse.json({
		    results: [
			{
			    id: 1,
			    name: 'Match review',
			    videos: [{ id: 2, slug: 'clip', title: 'Training clip' }],
			},
		    ],
		});
	    }),
	);
	const { container } = renderWithProviders(<Home />);
	expect(await screen.findByText('Match review')).toBeInTheDocument();
	await waitFor(() => expect(requests).toBe(1));
	expect(container.querySelector('.home > .featured')).toBeInTheDocument();
	expect(
	    container.querySelector('.playlist .wrapper .container'),
	).toBeInTheDocument();
	expect(container.querySelector('.navbar')).toBeInTheDocument();
	expect(
	    container.querySelector('.siteHeader, .homeMain, .heroSection'),
	).toBeNull();
	expect(
	    screen.getByRole('link', { name: 'Watch Training clip' }),
	).toHaveAttribute('href', '/watch/clip');
    });
});
