import './videoPlayer.scss';

const VideoPlayer = ({ embedUrl, title }) => {
    if (!embedUrl) {
	return null;
    }

    return (
	<div className='bunnyPlayerWrapper'>
	    <iframe
		src={`${embedUrl}?loop=true`}
		title={title || 'Video player'}
		className='bunnyPlayer'
		allow='autoplay; encrypted-media; picture-in-picture'
		allowFullScreen
	    />
	</div>
    );
};

export default VideoPlayer;
