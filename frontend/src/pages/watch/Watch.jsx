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

const Watch = () => {
    // Get video ID from the URL, e.g., '/watch/:videoID'
    const { videoId } = useParams();
    const { user } = useContext(UserContext);

    const [video, setVideo] = useState(null);
    const [playbackToken, setPlaybackToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Refetch video data if the video ID or user changes
    useEffect(() => {
	const fetchVideoData = async () => {
	    // Case where no video ID is passed as URL param
	    if (videoId) return;

	    setLoading(true);
	    setError(null);

	    try {
		/**
		 * STEP 1: Fetch the core video metadata
		 *
		 * Hit the backend with a video ID and retrieve its data.
		 * This is a public or semi-public endpoint.
		 **/

		const videoRes = await apiService.get(`api/videos/${videoId}/`);
		const videoData = videoRes.data;
		setVideo(videoData);

		/**
		 * STEP 2: Fetch a signed playback token.
		 *
		 * Only if the video is premium.
		 * This is a secure, authenticated endpoint.
		 **/

		if (videoData.is_premium) {
		    // Ensure the user is logged in before attempting to fetch  a token
		    if (!user) {
			throw new Error('You must be logged in to watch premium content.');
		    }
		    const tokenRes = await apiService.get(`api/videos/${videoId}/get-playback-token/`);
		    setPlaybackToken(tokenRes.data.token);
		}

	    } catch (err) {

	    } finally {

	    }
	};

	fetchVideoData();
    }, [videoId, user]);
};
