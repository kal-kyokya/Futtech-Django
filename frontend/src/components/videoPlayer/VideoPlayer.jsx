import './videoPlayer.scss';

export default function VideoPlayer({ embedUrl, title }) {
    if (!embedUrl)
	return (
	    <p className='empty-state'>
		Playback is not available for this video yet.
	    </p>
	);
    // Preserve existing signed query parameters when enabling looping.
    const url = new URL(embedUrl, window.location.origin);
    url.searchParams.set('loop', 'true');
    return (
	<div className='bunnyPlayerWrapper'>
	    <iframe
		src={url.toString()}
		title={title || 'Video player'}
		className='bunnyPlayer'
		allow='autoplay; encrypted-media; picture-in-picture'
		allowFullScreen
	    />
	</div>
    );
}
