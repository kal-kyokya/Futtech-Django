import { describe, expect, it } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { server } from './msw/server';
import apiClient, { normalizeError } from '../services/apiClient';
import tokenService from '../services/tokenService';

describe('API refresh concurrency', () => {

    it('retries every queued request at most once and shares a single refresh', async () => {
	let refreshes = 0;
	let requests = 0;

	server.use(
	    http.get('*/restricted/:id', () => {
		requests += 1;
		return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
	    }),
	    http.post('*/auth/token/refresh/', async () => {
		refreshes += 1;
		await delay(30);
		return HttpResponse.json({ access: 'new-access' });
	    }),
	);

	tokenService.setAccessToken('expired-access');
	const results = await Promise.allSettled([
	    apiClient.get('/restricted/one'),
	    apiClient.get('/restricted/two'),
	]);

	expect(results.every((result) => result.status === 'rejected')).toBe(true);
	expect(refreshes).toBe(1);
	expect(requests).toBe(4);
    });

    it('rejects all waiting requests if refresh omits the access token', async () => {
	let refreshes = 0;

	server.use(
	    http.get('*/restricted/:id', () =>
		HttpResponse.json({}, { status: 401 }),
	    ),
	    http.post('*/auth/token/refresh/', async () => {
		refreshes += 1;
		await delay(30);
		return HttpResponse.json({});
	    }),
	);

	tokenService.setAccessToken('expired-access');
	const results = await Promise.allSettled([
	    apiClient.get('/restricted/one'),
	    apiClient.get('/restricted/two'),
	]);

	expect(results.every((result) => result.status === 'rejected')).toBe(true);
	expect(refreshes).toBe(1);
	expect(tokenService.hasTokens()).toBe(false);
    });

    it('normalizes payment errors as messages rather than field errors', () => {
	const error = normalizeError({
	    response: {
		status: 400,
		data: { error: 'Unsupported payment provider.' },
	    },
	});

	expect(error.message).toBe('Unsupported payment provider.');
	expect(error.fields).toBeNull();
    });
});
