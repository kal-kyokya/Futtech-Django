import './playlistItem.scss';
import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import resolveVideoThumbnail from '../../utils/videoThumbnail';

const PlaylistItem = ({ videoId, video: playlistVideo, index }) => {
    const { videos } = useContext(VideoContext);

    const video = useMemo(() => {
	if (playlistVideo && typeof playlistVideo === 'object') {
	    return playlistVideo;
	}

	const lookupId = String(videoId ?? playlistVideo ?? '');
	return Array.isArray(videos)
	    ? videos.find((item) => String(item.id || item._id) === lookupId) || null
	    : null;
    }, [playlistVideo, videoId, videos]);

    const videoIdentifier = video?.id || video?._id || videoId || playlistVideo;
    const watchSlug = video?.slug || videoIdentifier;
    const thumbnailSrc = resolveVideoThumbnail(video);
    const itemNumber = String(index + 1).padStart(2, '0');

    if (!video) {
	return (
	    <div className='playlistItem playlistItem--loading' aria-hidden='true'>
		<div className='playlistItemPlaceholder' />
	    </div>
	);
    }

    return (
	<Link
	    to={`/watch/${watchSlug}`}
	    state={{ video, origin: 'playlist' }}
	    className='link playlistItemLink'
	    aria-label={`Watch ${video.title || 'video'}`}
	>
	    <article className='playlistItem'>
		{thumbnailSrc ? (
		    <img
			src={thumbnailSrc}
			alt={`${video.title || 'Video'} thumbnail`}
			loading='lazy'
		    />
		) : (
		    <div className='playlistItemFallback' aria-hidden='true'>
			<span>{video.title?.charAt(0)?.toUpperCase() || 'V'}</span>
		    </div>
		)}

		<div className='playlistItemOverlay'>
		    <span className='playlistItemIndex'>{itemNumber}</span>
		    <div className='playlistItemMeta'>
			<h3>{video.title || 'Untitled video'}</h3>
			{video.category && <span>{video.category}</span>}
		    </div>
		</div>
	    </article>
	</Link>
    );
};

export default PlaylistItem;
