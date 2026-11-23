import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './msw/server';
import contentService from '../services/contentService';
import tokenService from '../services/tokenService';

describe('Private content cache isolation', () => {

    it('does not reuse cached playlists after an account change', async () => {
	server.use(
	    http.get('*/playlists/private/', ({ request }) =>
		HttpResponse.json({
		    id: 'private',
		    name: request.headers.get('Authorization'),
		}),
	    ),
	);

	tokenService.setAccessToken('first-user');
	expect((await contentService.fetchPlaylist('private')).name).toBe(
	    'Bearer first-user',
	);

	tokenService.clearAccessToken();
	tokenService.setAccessToken('second-user');
	expect((await contentService.fetchPlaylist('private')).name).toBe(
	    'Bearer second-user',
	);
    });

    it('discards responses issued before logout instead of repopulating the cache', async () => {
	let release;
	let started;

	const pending = new Promise((resolve) => {
	    release = resolve;
	});
	const entered = new Promise((resolve) => {
	    started = resolve;
	});

	server.use(
	    http.get('*/playlists/private/', async () => {
		started();
		await pending;
		return HttpResponse.json({ id: 'private', name: 'old user secret' });
	    }),
	);

	tokenService.setAccessToken('first-user');
	const request = contentService.fetchPlaylist('private');

	await entered;

	tokenService.clearAccessToken();
	tokenService.setAccessToken('second-user');

	release();
	expect(await request).toBeNull();
	expect(contentService.cache.size).toBe(0);
    });

    it('invalidates playlist lists after create, update, and delete', async () => {
	let reads = 0;

	server.use(
	    http.get('*/playlists/', () => {
		reads += 1;
		return HttpResponse.json({ results: [], count: 0, next: null });
	    }),
	    http.post('*/playlists/', () =>
		HttpResponse.json({ id: 'list-1', name: 'Created' }),
	    ),
	    http.patch('*/playlists/list-1/', () =>
		HttpResponse.json({ id: 'list-1', name: 'Updated' }),
	    ),
	    http.delete(
		'*/playlists/list-1/',
		() => new HttpResponse(null, { status: 204 }),
	    ),
	);

	tokenService.setAccessToken('owner');

	await contentService.fetchPlaylists();
	await contentService.createPlaylist({ name: 'Created' });
	await contentService.fetchPlaylists();
	await contentService.updatePlaylist('list-1', { name: 'Updated' });
	await contentService.fetchPlaylists();
	await contentService.deletePlaylist('list-1');
	await contentService.fetchPlaylists();
	expect(reads).toBe(4);
    });

    it('uses the backend video detail route', async () => {
	server.use(
	    http.get('*/video/clip-1/', () =>
		HttpResponse.json({ id: 'clip-1', title: 'Clip' }),
	    ),
	);

	expect((await contentService.getVideoDetails('clip-1')).title).toBe('Clip');
    });
});
