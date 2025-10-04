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
 */
class TokenService {

    // Creates an instance of the TokenService class.
    constructor() {
	this.accessToken = null; // Keep in memory for security
    }

    /**
     * Handles WRITE operations on the Access token (in-memory only).
     *
     * @param {String} token - The backend-generated access token.
     */
    setAccessToken(token) {
	this.accessToken = token;
    }

    /**
     * Handles READ operations on the Access token.
     *
     * @returns {String} the Access token tied to this class instanciation.
     */
    getAccessToken() {
	return this.accessToken;
    }

    /**
     * Checks if the Access token exists.
     *
     * @returns {Boolean} true if it exists or converts 'null' values to false.
     */
    hasTokens() {
	return !!(this.accessToken);
    }

    // Clears the Access token (logout)
    clearAccessToken() {
	this.accessToken = null;
    }
}

export default new TokenService();
