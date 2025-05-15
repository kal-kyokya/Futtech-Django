import { useEffect, useRef } from 'react';

const VideoPlayer = ({ playbackId, videoTitle = 'Untitled', userId = 'anonymous', videoId = 'vid-001'}) => {
    const ref = useRef();

    useEffect(() => {
	if (!ref.current) return;

	// Set attributes manually to be React-safe
	ref.current.setAttribute('playback-id', playbackId);
	ref.current.setAttribute('metadata-video-id', videoId);
	ref.current.setAttribute('metadata-video-title', videoTitle);
	ref.current.setAttribute('metadata-viewer-user-id', userId);
	ref.current.setAttribute('stream-type', 'on-demand');
	ref.current.setAttribute('controls', '');
    }, [playbackId, videoTitle, userId, videoId]);

    return (
	    <mux-player
	ref={ref}
	style={{
	    width: '100%',
	    maxWidth: '800px',
	    aspectRatio: '16 / 9',
	    borderRadius: '10px',
	    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
	}}
	    ></mux-player>
    );
};

export default VideoPlayer;
