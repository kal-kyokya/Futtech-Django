import './videoPlayer.scss';
import { useEffect, useRef } from 'react';

const VideoPlayer = ({ playbackId, tokens, metadata}) => {
    const ref = useRef();

    useEffect(() => {
	if (!ref.current) return;

	// Set attributes manually to be React-safe
	ref.current.setAttribute('playback-id', playbackId);
	ref.current.setAttribute('tokens', tokens);
	ref.current.setAttribute('metadata-video-id', metadata.video_id);
	ref.current.setAttribute('metadata-video-title', metadata.video_title);
	ref.current.setAttribute('metadata-viewer-user-id', metadata.viewer_user_id);
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
