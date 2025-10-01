#!/usr/bin/env node
/**
 * 'tokenService.js' creates a secure token storage mechanism
 * 		     that solely uses in-memory (RAM) storage.
 */


/**
 * @class
 *
 * 'TokenService' bundles together the attributes methods required for
 * 		  successful creation of a secure token storage mechanism.
 */
class TokenService {

    // Creates an instance of the TokenService class.
    constructor() {
	this.accessToken = null; // Keep in memory for security
    }

    /**
     * Handles WRITE operations on the Access token (in-memory only).
     *
     * @param {string} token - The backend-generated access token.
     */
    setAccessToken() {
	this.accessToken = token;
    }

    /**
     * Handles READ operations on the Access token.
     *
     * @return {string} the Access token tied to this class instanciation.
     */
    getAccessToken() {
	return this.accessToken;
    }

    // Checks if the Access token exists
    hasTokens() {
	return !!(this.accessToken);
    }

    // Clears the Access token (logout)
    clearAccessToken() {
	this.accessToken = null;
    }
}

export default new TokenService();
