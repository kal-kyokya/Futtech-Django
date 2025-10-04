#!/usr/bin/env node
/**
 * 'contentService.js' handles provision of playlist and video objects
 *		       with pagination and lazy loading.
 */

import apiClient from './apiClient';


/**
 * @class
 *
 * 'ContentService' encapsulates the attributes and methods required for
 * 		    effective backend delivery of video content as well as
 *		    frontend caching and distribution.
 */
class ContentService {
    // Creates an instance of the ContentService class
    constructor() {
	// Maps' keys can be of complex data type, not just string (JS Objects)
	this.cache = new Map();

	this.prefetchQueue = [];
	this.isPrefetching = false;
    }

    /**
     * Asynchronous function.
     * Fetches paginated playlists.
     *
     * @param {Number} page - The nth pagination section requested.
     * @param {Number} limit - The number of elements found on the page.
     */
    async fetchPlaylists(page = 1, limit = 10) {
	const cacheKey = `playlists_${page}_${limit}`;

	// Check cache first
	if (this.cache.has(cacheKey)) {
	    return this.cache.get(cacheKey);
	}

	try {
	    const response = await apiClient.get('/playlists/', {
		    params: { page, limit }
	    });

	    const data = {
		playlists: response.data.results,
		hasMore: !!response.data.next,
		nextPage: page + 1,
		totalCount: response.data.count,
	    };

	    // Cache the results
	    this.cache.set(cacheKey, data);

	    // Prefect the next page in the background
	    if (data.hasMore) {
		this.prefetchPage(page + 1, limit);
	    }

	    return data

	} catch (error) {
	    console.error('Failed to fetch playlists:', error);

	    return { playlists: [], hasMore: false };
	}
    }
}
