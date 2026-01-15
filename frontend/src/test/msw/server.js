import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Shared server instance for all tests.
export const server = setupServer(...handlers);
