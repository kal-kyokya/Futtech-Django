import './showcaseVideo.scss';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicHeader from '../../components/publicHeader/PublicHeader';
import showcaseService from '../../services/showcaseService';
import VideoPlayer from '../../components/videoPlayer/VideoPlayer';

const ShowcaseVideo = () => {
    const { slug } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
	let cancelled = false;
	setLoading(true);
	setError('');
	setVideo(null);

	const loadVideo = async () => {
	    try {
		const data = await showcaseService.fetchShowcaseVideo(slug);
		if (!cancelled) setVideo(data);
	    } catch (err) {
		console.error('Failed to load showcase detail', err);
		if (!cancelled) setError('This showcase video is unavailable');
	    } finally {
		if (!cancelled) setLoading(false);
	    }
	};

	loadVideo();
	return () => {
	    cancelled = true;
	};
    }, [slug]);

    return (
	<div className='showcaseVideoPage'>
	    <PublicHeader />

	    <main
		id='main-content'
		tabIndex={-1}
		className='showcaseVideo page-container'
	    >
		<Link to='/showcase' className='link showcaseVideo__back'>
		    ← Back to showcase
		</Link>

		{loading && (
		    <p role='status' className='status-message'>
			Loading video...
		    </p>
		)}
		{error && (
		    <p className='showcaseVideo__error' role='alert'>
			{error}
		    </p>
		)}

		{!loading && !error && video && (
		    <>
			<VideoPlayer embedUrl={video.embed_url} title={video.title} />
			<h1>{video.title}</h1>
			<p>{video.description || 'Public Futtech showcase clip.'}</p>
			<p className='showcaseVideo__note'>
			    Public showcase view. No subscription or account is needed for
			    this page.
			</p>
		    </>
		)}
	    </main>
	</div>
    );
};

export default ShowcaseVideo;
