import './featured.scss';
import { useState, useEffect, useMemo } from 'react';
import apiClient from '../../services/apiClient';
import resolveVideoThumbnail from '../../utils/videoThumbnail';

const buildFeaturedEndpoint = () => '/videos/featured/?limit=10';

const normalizeFeaturedItems = (payload) => {
    if (Array.isArray(payload)) {
	return payload;
    }

    if (Array.isArray(payload?.results)) {
	return payload.results;
    }

    return payload ? [payload] : [];
};

const pickFeaturedItem = (items, category) => {
    if (!Array.isArray(items) || items.length === 0) {
	return null;
    }

    if (!category) {
	return items[0];
    }

    if (category === 'analysis') {
	return items.find((item) => item?.is_analysis) || items[0];
    }

    if (category === 'video') {
	return items.find((item) => !item?.is_analysis) || items[0];
    }

    return items[0];
};

const Featured = ({ category }) => {
    const [content, setContent] = useState(null);

    const endpoint = useMemo(() => buildFeaturedEndpoint(), []);

    useEffect(() => {
	let isMounted = true;

	const getContent = async () => {
	    try {
		const response = await apiClient.get(endpoint);
		const items = normalizeFeaturedItems(response.data);
		const selected = pickFeaturedItem(items, category);

		if (isMounted) {
		    setContent(selected || null);
		}
	    } catch (error) {
		console.error('Failed to fetch featured content:', error);
		if (isMounted) {
		    setContent(null);
		}
	    }
	};

	getContent();

	return () => {
	    isMounted = false;
	}
    }, [category, endpoint]);

    const fallbackImage = category === 'video'
	  ? '/drone.jpg'
	  : category
	  ? 'balltech.png'
	  : '/poa.JPEG';

    return (
	<div className='featured'>
	    {category &&
	     <div className='category'>
		 <span>{ category === 'video' ? 'Footages' : 'Analysis' }</span>
		 <select name='category' id='category'>
		     <option>Categories</option>
		     <option value='training'>Training</option>
		     <option value='game'>Games</option>
		 </select>
	     </div>
	    }

	    <img src={ resolveVideoThumbnail(content) || fallbackImage }
		 alt="Featured section's image"
	    />

	    <div className='info'>
		<span className='poppins-extrabold-italic'>
		    { category ?
		      category === 'video' ?
		      <h4><i>Bird’s-eye tactical view of players' decision-making, off-the-ball movement and positioning—for post-training and post-game analysis.</i></h4> :
		      <h4><i>Processed training and game footage—highlighting areas of improvements in team formations, tactics, player movements, and decision-making.</i></h4>
		      : <h4><i>As an active footballer, I want to review footage of my games & training sessions. Analyze my: positioning, off-the-ball movement, decision-making and improve my game.</i></h4> }
		</span>
	    </div>
	</div>
    );
};

export default Featured;
