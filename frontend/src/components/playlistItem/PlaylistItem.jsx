import './playlistItem.scss';
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { VideoContext } from '../../contexts/videoContext/VideoContext';

const PlaylistItem = ({ videoId, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { videos } = useContext(VideoContext);
    const video = videos.filter((item) => (item.id || item._id) === videoId)[0];

    return (
	<Link to={`/watch/${videoId}`}
	      state={ { video, origin: "playlist" } }
	      className='link'
	>
	    <div className='playlistItem'
		 style={{
		     transform: isHovered ? "scale(1.2)" : "scale(1)",
		     zIndex: isHovered ? 10 : 1
		 }}
		 onMouseEnter={ () => setIsHovered(true) }
		 onMouseLeave={ () => setIsHovered(false) }
	    >
		{!isHovered &&
		 <img src={ video.thumbnail }
		      alt='Video Content'
		 />}
		{isHovered && <video src={ video?.thumbnail } autoPlay loop muted />}
	    </div>
	</Link>
    );
}

export default PlaylistItem;
