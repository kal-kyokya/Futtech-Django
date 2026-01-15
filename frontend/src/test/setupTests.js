import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './msw/server';
import tokenService from '../services/tokenService';

// Ensure API base URL is always defined for tests that rely on apiClient.
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost');

beforeAll(() => {
    // Fail fast if a test issues a network request without a handler.
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    // Reset per-test handlers and clear any persisted auth state.
    server.resetHandlers();
    tokenService.clearAccessToken();
    localStorage.clear();
});

afterAll(() => {
    // Clean up MSW once the test suite finishes.
    server.close();
});
