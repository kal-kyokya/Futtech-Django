import './watch.scss';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import MuxPlayer from '@mux-player-react';

import { UserContext } from '../../contexts/userContext/UserContext';
import Navbar from '../../components/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Re-using the same conceptual API service as in '../newVideo/NewVideo'
const apiService = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    interceptors: {
	request: (config) => {
	    const user = JSON.parse(localStorage.getItem('user'));
	    if (user && user.accessToken) {
		config.headers.Authorization = `Bearer ${user.accessToken}`;
	    }
	    return config;
	},
    },
});
