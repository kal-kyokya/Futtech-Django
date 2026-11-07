#!/usr/bin/env node
/**
 * 'tokenService.js' creates a secure token storage mechanism
 * 		     that solely uses in-memory (RAM) storage.
 */


/**
 * @class
 *
 * 'TokenService' encapsulates the attributes and methods required for
 * 		  effective creation of a secure token storage mechanism.
 *
 * 		  Access tokens live only in memory.
 * 		  The HttpOnly cookie restores sessions.
 */
export class TokenService {

    // Creates an instance of the TokenService class.
    constructor() {
	this.accessToken = null; // Keep in memory for security
	this.listeners = new Set();
	// Remove tokens persisted by older application versions.
	try {
	    window.localStorage.removeItem('futtech_access_token');
	} catch {
	    // Memory-only authentication also works when storage is unavailable.
	}
    }

    /**
     * Handles WRITE operations on the access token (in-memory only).
     *
     * @param {String} token - The backend-generated access token.
     */
    setAccessToken(token) {
	this.accessToken = typeof token === 'string' && token ? token : null;
	this.listeners.forEach((listener) => listener(this.accessToken));
    }

    /**
     * Handles READ operations on the access token.
     *
     * @returns {String} the access token tied to this class instanciation.
     */
    getAccessToken() {
	return this.accessToken;
    }

    /**
     * Checks if the access token exists.
     *
     * @returns {Boolean} true if it exists or converts 'null' values to false.
     */
    hasTokens() {
	return Boolean(this.accessToken);
    }

    rehydrate() {
	return this.accessToken;
    }

    // Clears the access token (logout)
    clearAccessToken() {
	this.setAccessToken(null);
    }

    subscribe(listener) {
	this.listeners.add(listener);
	return () => this.listeners.delete(listener);
    }
}

export default new TokenService();
