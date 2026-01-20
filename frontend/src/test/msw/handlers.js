import { HttpResponse, delay, http } from 'msw';

// Basic user factory for consistent test payloads.
const createUser = (overrides = {}) => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    ...overrides,
});

export const handlers = [
    // Default "happy path" handlers are overridden per-test for unhappy cases.
    http.post('*/auth/register/', async () => {
	await delay(50);
	return HttpResponse.json(
	    {
		message: 'Registration successful.',
		user: createUser(),
		access: 'access-token',
	    },
	    { status: 201 },
	);
    }),
    http.post('*/auth/login/', async () => {
	await delay(50);
	return HttpResponse.json(
	    {
		message: 'Login successful',
		user: createUser(),
		access: 'access-token',
	    },
	    { status: 200 },
	);
    }),
    http.post('*/auth/token/refresh/', async () => {
	await delay(50);
	return HttpResponse.json(
	    {
		access: 'access-token',
	    },
	    { status: 200 },
	);
    }),
    http.post('*/auth/logout/', async () => {
	await delay(50);
	return HttpResponse.json({ message: 'Logged out.' }, { status: 200 });
    }),
    http.post('*/auth/me/', async () => {
	await delay(50);
	return HttpResponse.json(createUser(), { status: 200 });
    }),
    // These endpoints are invoked during the login flow to fetch content.
    http.get('*/playlists/', async () => {
	await delay(10);
	return HttpResponse.json({ results: [] }, { status: 200 });
    }),
    http.get('*/videos/featured/', async () => {
	await delay(10);
	return HttpResponse.json({ results: [] }, { status: 200 });
    }),
];
