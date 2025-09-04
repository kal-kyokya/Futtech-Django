import './newVideo.scss';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../contexts/userContext/UserContext';
import Navbar from '../../components/Navbar';


/**
 * apiService - An instance of Axios serving as conceptual API service for
 *		making authenticated requests to our Django backend.
 *		This will handle attaching auth tokens (JWTs) to requests.
 *
 * @params {Object} config - Default config for the instance (HTTP request?).
 *
 * @returns {Axios} a customized instance of Axios.
 */
const apiService = axios.create({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    interceptors: { // This will attach the auth token to every request
	request: (config) => {
	    const user = JSON.parse(localStorage.getItem('user'));
	    if (user && user.accessToken) {
		config.headers.Authorization = `Bearer ${user.accessToken}`;
	    }

	    return config;
	},
    },
});
