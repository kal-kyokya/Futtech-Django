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

    );
};

export default VideoPlayer;
