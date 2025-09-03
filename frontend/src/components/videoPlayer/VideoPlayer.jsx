import './videoPlayer.scss';
import { useEffect, useRef } from 'react';

const VideoPlayer = ({ playbackId, videoId, videoTitle, userId}) => {
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
	ref.current.setAttribute('class', 'muxPlayer');
    }, [playbackId, videoTitle, userId, videoId]);

    return (
	    <mux-player ref={ref}>
	    </mux-player>
    );
};

export default VideoPlayer;
