import './showcase.scss';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../../components/publicHeader/PublicHeader';
import showcaseService from '../../services/showcaseService';

const Showcase = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
	let cancelled = false;
	const loadShowcase = async () => {
	    try {
		const data = await showcaseService.fetchShowcaseVideos();
		if (!cancelled) setVideos(Array.isArray(data) ? data : []);
	    } catch (err) {
		console.error('Failed to load showcase videos', err);
		if (!cancelled)
		    setError('We could not load showcase videos right now.');
	    } finally {
		if (!cancelled) setLoading(false);
	    }
	};

	loadShowcase();
	return () => {
	    cancelled = true;
	};
    }, []);

    return (
	<div className='showcasePage'>
	    <PublicHeader />

	    <main id='main-content' tabIndex={-1}>
		<section className='showcaseHero'>
		    <p className='showcaseBadge'>Public Showcase · No account needed</p>
		    <h1>Explore Futtech video edits instantly</h1>
		    <p>
			Collaborators, clients and recruiters can watch
			selected clips right away. Sign in only for private member features.
		    </p>
		    <div className='showcaseHero__actions'>
			<Link className='link heroAction primary' to='/login'>
			    Sign in for member tools
			</Link>
			<a
			    className='link heroAction secondary'
			    href='mailto:futtech@kalkyokya.tech'
			>
			    Contact Futtech
			</a>
		    </div>
		</section>

		<section className='showcaseGridSection'>
		    {loading && (
			<p role='status' className='status-message'>
			    Loading showcase...
			</p>
		    )}
		    {error && (
			<p className='showcaseError' role='alert'>
			    {error}
			</p>
		    )}

		    {!loading && !error && videos.length == 0 && (
			<p className='empty-state'>No showcase videos are published yet.</p>
		    )}

		    <div className='showcaseGrid'>
			{videos.map((video) => (
			    <article className='showcaseCard' key={video.id}>
				<Link
				    to={`/showcase/${video.slug}`}
				    aria-label={`Watch ${video.title}`}
				>
				    <div className='showcaseCard__thumb'>
					{video.thumbnail ? (
					    <img
						src={video.thumbnail}
						alt={video.title}
						loading='lazy'
					    />
					) : (
					    <span>Showcase Video</span>
					)}
				    </div>
				</Link>
				<div className='showcaseCard__content'>
				    <h2>{video.title}</h2>
				    <p>
					{video.description ||
					 'Selected public highlight from Futtech.'}
				    </p>
				    <Link
					className='link showcaseCard__link'
					to={`/showcase/${video.slug}`}
				    >
					Watch video
				    </Link>
				</div>
			    </article>
			))}
		    </div>
		</section>
	    </main>
	</div>
    );
};

export default Showcase;
