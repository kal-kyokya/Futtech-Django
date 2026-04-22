import './showcaseVideo.scss';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicHeader from '../../components/publicHeader/PublicHeader';
import showcaseService from '../../services/showcaseService';
import VideoPlayer from '../../components/videoPlayer/VideoPlayer';

const showcaseVideo = () => {
    const { slug } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
	const loadVideo = async () => {
	    try {
		const data = await showcaseService.fetchShowcaseVideo(slug);
		setVideo(data);
	    } catch (err) {
		console.error('Failed to load showcase detail', err);
		setError('This showcase video is unavailable');
	    } finally {
		setLoading(false);
	    }
	};

	loadVideo();
    }, [slug]);

    return (
	<div className='showcaseVideo'>
	    <PublicHeader />
	    <main className='showcaseVideo'>
		<Link
		    to='/showcase'
		    className='link showcaseVideo__back'
		>
		    ← Back to showcase
		</Link>

		{loading && <p>Loading video...</p>}
		{error && <p className='showcaseVideo__error'>{error}</p>}

		{!loading && !error && video && (
		    <>
			<h1>{video.title}</h1>
			<p>{video.description || 'Public Futtech showcase clip.'}</p>
			<p className='showcaseVideo__note'>
			    Public showcase view. No subscription or account is needed for this page.
			</p>
			<VideoPlayer
			    embedUrl={video.embed_url}
			    title={video.title}
			/>
		    </>
		)}
	    </main>
	</div>
    );
};

export default showcaseVideo;
