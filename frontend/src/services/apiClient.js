/**
 * 'apiClient.js' configures Axios with interceptors, via the creation of
 *		  an Axios instance that automatically handles token refresh.
 */

import axios from 'axios';
import tokenService from './tokenService';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create the Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
	'Content-Type': 'application/json',
    },
    withCredentials: true,
});

/**
 * Skip refresh recursion on auth endpoints to avoid infinite retry loops
 * (e.g. failed login should surface to UI, not trigger refresh).
 */
const isAuthEndpoint = (url = '') =>
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh');

/**
 * Normalize heterogenous backend/network failures into one UI-friendly shape.
 *
 * Returns: { status, message, fields, code?, title? }
 */
export const normalizeError = (error) => {
    const response = error?.response;
    const status = response?.status ?? null;
    const data = response?.data;
    const fallbackMessage = error?.message || 'Unexpected error.';

    if (!response) {
	return {
	    status,
	    message: 'Network error. Please check your connection.',
	    fields: null,
	};
    }

    if (data && typeof data === 'object') {
	const nonFieldErrors = data.non_field_errors;
	const message = data.detail
	      || data.message
	      || (Array.isArray(nonFieldErrors)
		  ? nonFieldErrors.join(', ')
		  : nonFieldErrors)
	      || fallbackMessage;
	const fields = data.fields
	      || Object.fromEntries(
		  Object.entries(data)
		      .filter(([key]) => !['detail', 'message', 'status', 'title', 'code', 'non_field_errors'].includes(key))
		      .map(([key, value]) => [
			  key,
			  Array.isArray(value)
			      ? value.join(', ')
			      : String(value),
		      ]),
	      );

	return {
	    status,
	    code: data.code,
	    title: data.title,
	    message,
	    fields: Object.keys(fields).length ? fields : null,
	};
    }

    return {
	status,
	message: fallbackMessage,
	fields: null,
    };
};

/**
 * Makes an appendage to the 'apiClient' object with a
 * Request interceptor adding an access token to each request.
 */
apiClient.interceptors.request.use(
    (config) => {
	const token = tokenService.getAccessToken();
	if (token) {
	    config.headers.Authorization = `Bearer ${token}`;
	    config.headers.Accept = 'application/json';
	}

	return config;
    },
    (error) => Promise.reject(error),
);

// Definition of the Response interceptor handling token refresh
let isRefreshing = false;
let refreshSubscribers = [];

// Queue failed requests while a single refresh call is in flight.
const subscribeTokenRefresh = (subscriber) => {
    refreshSubscribers.push(subscriber);
};

const flushRefreshSubscribers = ({ token = null, error = null } = {}) => {
    refreshSubscribers.forEach(( { resolve, reject }) => {
	if (token) {
	    resolve(token);
	    return;
	}

	reject(error || new Error('Token refresh failed'));
    });
    refreshSubscribers = [];
};

// Actual Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
	const originalRequest = error.config;

	// If this was a login/register/refresh request, NEVER try refresh/redirect here.
	if (isAuthEndpoint(originalRequest?.url)) {
	    return Promise.reject(error);
	}

	// Check if error is 401 and we haven't already tried to refresh
	if (error.response?.status === 401 && !originalRequest._retry) {

	    if (isRefreshing) {
		// Avoid racing multiple refresh calls; replay once token arrives.
		return new Promise((resolve, reject) => {
		    subscribeTokenRefresh({ resolve, reject });
		}).then((token) => {
		    originalRequest.headers.Authorization = `Bearer ${token}`;
		    return apiClient(originalRequest);
		});
	    }

	    originalRequest._retry = true;
	    isRefreshing = true;

	    try {
		// Call the refresh endpoint on the backend
		const response = await axios.post(
		    `${API_BASE_URL}/auth/token/refresh/`,
		    {},
		    { withCredentials: true },
		);

		const { access } = response.data;

		// Update the access token
		tokenService.setAccessToken(access);

		// Retry all queued requests
		flushRefreshSubscribers({ token: access });

		// Retry the original request
		originalRequest.headers.Authorization = `Bearer ${access}`;
		return apiClient(originalRequest);

	    } catch (refreshError) {
		// Ensure queued requests fail fast if refresh cannot recover auth.
		flushRefreshSubscribers({ error: refreshError });

		// Hard-fail auth: clear volatile token and force a clean login.
		tokenService.clearAccessToken();
		window.location.href = '/login';

		return Promise.reject(refreshError);
	    } finally {
		isRefreshing = false;
	    }
	}

	error.normalized = normalizeError(error);
	return Promise.reject(error);
    },
);

export default apiClient;
