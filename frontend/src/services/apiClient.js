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
    }
});
