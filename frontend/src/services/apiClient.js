#!/usr/bin/env node
/**
 * 'apiClient.js' configures Axios with interceptors, via the creation of
 *		  an Axios instance with interceptors to automatically handle
 * 		  token refresh.
 */

import axios from 'axios';
import tokenService from './tokenService';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create the Axios instance
const apiClient = axios.create({
    baseUrl: API_BASE_URL,
    headers: {
	'Content-Type': 'application/json',
    },
});

/**
 * Make an appendage to the 'apiClient' object with
 * a Request interceptor adding the access token
 */
apiClient.interceptors.request.use(
    (config) => {
	const token = tokenService.getAccessToken();
	if (token) {
	    config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let refreshSubscribers = [];

// Queue failed requests while refreshing
const subscribTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
    refreshSubscribers.forEach(
	(cb) => cb(token);
    );
    refreshSubscribers = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
	const originalRequest = error.config;

	// Check if error is 401 and we haven't already tried to refresh
	if (error.response?.status === 401 && !(orginalRequest._retry)) {

	    if (isRefreshing) {
		// If already refreshing, queue this request
		return new Promise((resolve) => {
		    subscribeTokenRefresh((token) => {
			originalRequest.headers.Authorization = `Bearer ${token
}`;

			resolve(apiClient(originalRequest));
		    });
		});
	    }

	    originalRequest._retry = true;
	    isRefreshing = true;

	    try {
		// Call the refresh endpoint on the back end
		const response = await axios.post(
		    `${API_BASE_URL}/auth/token/refresh/`,
		);

		const { access } = response.data;

		// Update the access token
		tokenService.setAccessToken(access);

		// Retry all queued requests
		onRefreshed(access);

		// Retry the original request
		originalRequest.headers.Authorization = `Bearer ${access}`;
		return apiClient(originalRequest);

	    } catch (refreshError) {
		// Refresh failed - Clear tokens and redirect to login
		tokenService.clearAccessToken();
		window.location.href = '/login';

		return Promise.reject(refreshError);
	    } finally {
		isRefreshing = false;
	    }
	}

	return Promise.reject(error);
    },
);

export default apiClient;
