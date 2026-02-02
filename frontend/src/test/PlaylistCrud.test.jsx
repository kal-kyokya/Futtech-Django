import { beforeEach, describe, expect, it } from 'vitest';
import { HttpResponse, http } from 'msw';
import { server } from './msw/server';
import contentService from '../services/contentService';

describe('Playlist CRUD service flows', () => {
    beforeEach(() => {
	contentService.cache.clear()
    });

    it('creates a playlist via the API', async () => {
	const payload = {
	    name: 'Shooting drills',
	    description: "A collection of training session video working the pklayer's shooting technique",
	    is_public: true,
	};
	const responsePayload = { id: 72, ...payload };

	server.use(
	    http.post('*/playlists/', async ({ request }) => {
		const body = await request.json();
		expect(body).toEqual(payload);
		return HttpResponse.json(responsePayload, { status: 201 });
	    }),
	);

	const result = await contentService.createPlaylist(payload);

	expect(result).toEqual(responsePayload);
    });

    it('retrieves a playlist by id', async () => {
	const playlistId = '1996';
	const responsePayload = {
	    id: Number(playlistId),
	    name: 'Assertive moments',
	    description: 'A collection of videos showing players bravely express themselves',
	    is_public: false,
	};

	server.use(
	    http.get(`*/playlists/${playlistId}`, async () => (
		HttpResponse.json(responsePayload, { status: 200 })
	    )),
	);

	const result = await contentService.fetchPlaylist(playlistId);

	expect(result).toEqual(responsePayload);
    });

    it('Updates a playlist via the API', async () => {
	const playlistId = '2003';
	const payload = { name: 'Futtech Made It' };
	const responsePayload = {
	    id: Number(playlistId),
	    name: 'Futtech Made It',
	    description: 'A collection of the best moments recorded by Futtech',
	    is_public: true,
	};

	server.use(
	    http.patch(`*/playlists/${playlistId}`, async ({ request }) => {
		const body = await request.json();
		expect(body).toEqual(payload);
		return HttpResponse.json(responsePayload, { status: 200 });
	    }),
	);

	const result = await contentService.updatePlaylist(playlistId, payload);

	expect(result).toEqual(responsePayload);
    });

    it('deletes a playlist via the API', async () => {
	const playlistId = '1972';

	server.use(
	    http.delete(`*/playlists/${playlistId}`, async () => (
		new HttpResponse(null, { status: 204 })
	    )),
	);

	const result = await contentService.deletePlaylist(playlistId);

	expect(result).toBe(true);
    });
});
