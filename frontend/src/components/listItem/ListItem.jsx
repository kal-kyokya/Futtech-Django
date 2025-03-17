import './listItem.scss';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ListItem = ({ videoId, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [video, setVideo] = useState({});

    useEffect(() => {
	const getVideo = async () => {
	    try {
		const res = await axios.get('/videos/get/' + videoId, {
					    headers: {
						token: ''
					    }
		});
		setVideo(res.data);
	    } catch (err) {
		console.log(err);
	    }
	};

	getVideo();
    }, [video]);

    return (
	<Link to={ { pathname: '/watch', watch: video } }>
	<div className='listItem'
	     style={{ transform: isHovered ? "scale(1.2)" : "scale(1)", zIndex: isHovered ? 10 : 1 }}
	     onMouseEnter={ () => setIsHovered(true) }
	     onMouseLeave={ () => setIsHovered(false) }
	>
	    {!isHovered &&
	     <img src={ video.thumbnailSmall }
		  alt='Website Owner proudly holding the Congolese flag'
	     />}
	    {isHovered &&
	     <video src={ video.trailer } autoPlay={true} loop />}
	</div>
	</Link>
    );
}

export default ListItem;
