import './watch.scss';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import VideoPlayer from '../../components/videoPlayer/VideoPlayer';

import Navbar from '../../components/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import apiClient from '../../services/apiClient';

const Watch = () => {
    const { slug } = useParams();
    const { state } = useLocation();

    const [video, setVideo] = useState(null);
    const [embedUrl, setEmbedUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Refetch video data if the video slug changes
    useEffect(() => {
	const fetchVideoData = async () => {
	    if (!slug) {
		setError('Missing video slug');
		setLoading(false);
		return;
	    }

	    setLoading(true);
	    setError(null);

	    try {
		const stateVideo = state?.video;
		const identifiers = [
		    slug,
		    stateVideo?.slug,
		    stateVideo?.id,
		    stateVideo?._id,
		].filter(
		    Boolean
		).filter(
		    (identifier, index, all) => all.indexOf(identifier) === index
		);

		let lastError = null;

		for (const identifier of identifiers) {
		    try {
			const videoRes = await apiClient.get(`/video/${identifier}/`);
			setVideo(videoRes.data);

			const playbackRes = await apiClient.get(`/video/${identifier}/playback/`);
			setEmbedUrl(playbackRes.data.embed_url);
			return;
		    } catch (err) {
			lastError = err;
			if (err?.response?.status !== 404) {
			    throw err;
			}
		    }
		}

		throw lastError || new Error('Video not found');
	    } catch (err) {
		console.error('Failed to fetch video data', err);
		setError(err?.response?.data?.error || 'Could not load video. It may be private or does not exist.');
	    } finally {
		setLoading(false);
	    }
	};

	fetchVideoData();
    }, [slug, state]);

    if (loading) return <><Navbar /><div className='watch'>Loading video...</div></>
    if (error) return <><Navbar /><div className='watch error'>{error}</div></>
    if (!video) return <><Navbar /><div className='watch'>Video not found.</div></>

    return (
	<>
	    <Navbar />
	    <div className='watch'>
		<Link className='link' to='/'>
		    <div className='iconLeft'>
			<ArrowBackIcon className='arrow' />
			Home
		    </div>
		</Link>

		<VideoPlayer embedUrl={embedUrl} title={video.title} />

		<div className='videoDetails'>
		    <h1 className='videoTitle'>{video.title}</h1>
		    <p className='videoDescription'>{video.description}</p>
		    {video.is_premium && <span className='premiumBadge'>Premium</span>}
		</div>
	    </div>
	</>
    );
};

export default Watch;
