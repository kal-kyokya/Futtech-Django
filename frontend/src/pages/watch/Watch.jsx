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
		console.error('Failed to fetch video data', err);
		setError(err.message || 'Could not load video. It may be private or does not exist.');
	    } finally {
		setLoading(false);
	    }
	};

	fetchVideoData();
    }, [videoId, user]);

    /**
     * Set of possible render logics when video is not ready for playback.
     *
     * It is based on the preceding data logic.
     **/

    if (loading) {
	return (
	    <>
		<Navbar />
		<div className='watch'>
		    Loading video...
		</div>
	    </>
	);
    }

    if (error) {
	return (
	    <>
		<Navbar />
		<div className='watch error'>
		    {error}
		</div>
	    </>
	);
    }

    if (video.status !== 'ready') { // The video is still processing
	return (
	    <>
		<Navbar />
		<div className='watch'>
		    <h1>{video.title}</h1>
		    <p>This video is still processing. Please check back in a few moments.</p>
		</div>
	    </>
	);
    }

    // Render logic once videos are ready for playback
    return (
	<>
	    <Navbar />
	    <div className='watch'>
		<Link className='limk'
		      to='/'
		>
		    <div className='back'>
			<ArrowBackIcon />
			Home
		    </div>
		</Link>

		<MuxPlayer playbackId={video.mux_playback_id}
			   tokens={{ playback: playbackToken }}
			   metadata={{
			       video_id: video.id,
			       video_title: video.title,
			       viewer_user_id: user ? user.id : null,
			   }}
		/>

		<div className='videoDetails'>
		    <h1 className='videoTitle'>{video.title}</h1>
		    <p className='videoDescription'>{video.description}</p>

		    {video.is_premium &&
		     <span className='premiumBadge'>
			 Premium
		     </span>}
		</div>

	    </div>
	</>
    );
};

export default Watch;
