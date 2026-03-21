import './playlistItem.scss';
import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import resolveVideoThumbnail from '../../utils/videoThumbnail';

const PlaylistItem = ({ videoId, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { videos } = useContext(VideoContext);

    const video = useMemo(
	() => (Array.isArray(videos)
	       ? videos.find((item) => (item.id || item._id) === videoId) || null
	       : null),
	[videoId, videos],
    );

    const thumbnailSrc = resolveVideoThumbnail(video);
    const itemNumber = String(index + 1).padStart(2, '0');

    if (!video) {
	return (
	    <div className='playlistItem playlistItem--loading'
		 aria-hidden='true'
	    >
		<div className='playlistItemPlaceholder' />
	    </div>
	);
    }

    return (
	<Link to={`/watch/${videoId}`}
	      state={ { video, origin: 'playlist' } }
	      className='link playlistItemLink'
	      aria-label={`Watch ${video.title || 'video'}`}
	>
	    <article
		className='playlistItem'
		style={{
		    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
		    zIndex: isHovered ? 10 : 1
		}}
		onMouseEnter={ () => setIsHovered(true) }
		onMouseLeave={ () => setIsHovered(false) }
	    >
		{thumbnailSrc ? (
		    <img src={thumbnailSrc}
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
