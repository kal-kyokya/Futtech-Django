#!/usr/bin/env node
/**
 * 'authService.js' bundles authentication related operations under
 * 		    one class and makes the Futtech codebase more elegant.
 */

import apiClient, { normalizeError } from './apiClient';
import tokenService from './tokenService';


/**
 * @class
 *
 * 'AuthService' encapsulates the class methods required for
 *		 effective management of authentication processes.
 */
class AuthService {

    /**
     * Asynchronous function.
     * Handles user registration requests.
     *
     * @param {Object} userData - The user info required for registration.
     */
    async register(userData) {

	try {
	    const response = await apiClient.post('/auth/register/', userData);
	    const { message, access, user } = response.data;

	    // Stores the access token in memory
	    tokenService.setAccessToken(access);

	    // Fetches initial content
	    const playlistsPromise = this.fetchInitialContent();

	    return {
		success: true,
		user,
		message,
		playlistsPromise,
	    };
	} catch (error) {
	    const normalized = error?.normalized || normalizeError(error);
	    return {
		success: false,
		error: normalized,
	    };
	}
    }

    /**
     * Asynchronous function.
     * Handles every user log in request.
     *
     * @param {Object} credentials - The user data required for log in.
     */
    async login(credentials) {

	try {
	    const response = await apiClient.post('/auth/login/', credentials);
	    const { message, access, user } = response.data;

	    // Stores the access token in memory
	    tokenService.setAccessToken(access);

	    // Immediately fetches the initial content (playlists)
	    const playlistsPromise = this.fetchInitialContent();
	    return {
		user,
		message,
		success: true,
		playlistsPromise, // Returns a promise for component to handle
	    };

	} catch (error) {
	    const normalized = error?.normalized || normalizeError(error);
	    return {
		success: false,
		error: normalized,
	    };
	}
    }

    // Handles the log out workflow
    async logout() {
	try {
	    await apiClient.post('/auth/logout/', {});
	    return { success: true };
	} catch (error) {
	    const normalized = error?.normalized || normalizeError(error);
	    console.error('Logout error:', error);
	    return {
		success: false,
		error: normalized,
	    };
	}
    }

    // Fetches the first batch of playlists and their associated videos
    async fetchInitialContent() {

	try {
	    const [playlistsResponse, featuredResponse] = await Promise.all([
		apiClient.get('/playlists/?page=1&limit=10'),
		apiClient.get('/videos/featured/?limit=20'),
	    ]);

	    return {
		playlists: playlistsResponse.data,
		featured: featuredResponse.data,
	    };

	} catch (error) {
	    console.error('Failed to fetch initial content: ', error);

	    return { playlists: [], featured: [] };
	}
    }

    // Fetches the details of currently logged in user
    async getCurrentUser() {

	try {
	    const response = await apiClient.get('/auth/me/');

	    return response.data;
	} catch (error) {
	    return null;
	}
    }

    // Confirms that the current user has an access token
    isAuthenticated() {
	return tokenService.hasTokens();
    }

    // Rehydrates tokens from storage (window.localStorage)
    rehydrate() {
	return tokenService.rehydrate();
    }

}

export default new AuthService();
