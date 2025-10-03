#!/usr/bin/env node
/**
 * 'authService.js' bundles authentication related operations under
 * 		    one class and makes the Futtech codebase more elegant.
 */

import apiClient from './apiClient';
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
     * Handles every user log in request.
     *
     * @param {Object} credentials - The user data required for log in.
     */
    async login(credentials) {

	try {
	    const response = await apiClient.post('/auth/login', credentials);
	    const { message, access, user } = response.data;

	    // Store the access token in memory
	    tokenService.setAccessToken(access);

	    // Immediately fetch initial content (playlists)
	    const playlistsPromise = this.fetchInitialContent();
	    return {
		user,
		message,
		success: true,
		playlistsPromise, // Return promise for component to handle
	    };

	} catch (error) {
	    return {
		success: false,
		error: error.response?.data?.message || 'Login failed',
	    };
	}
    }

    /**
     * Asynchronous function.
     *
     * Fetches the first batch of playlists and videos.
     */
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
}
