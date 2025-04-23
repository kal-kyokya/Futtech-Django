import './listItem.scss';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/userContext/UserContext';
import { VideoContext } from '../../contexts/videoContext/VideoContext';

const ListItem = ({ videoId, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { user } = useContext(UserContext);
    const { videos } = useContext(VideoContext);
    const video = videos.filter((video) => video._id === videoId)[0];

    return (
	<Link to='/watch'
	      state={ { video } }
	      className='link'
	>
	    <div className='listItem'
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
		{isHovered &&
		 <video src={ video.content } autoPlay={true} loop />}
	    </div>
	</Link>
    );
}

export default ListItem;
