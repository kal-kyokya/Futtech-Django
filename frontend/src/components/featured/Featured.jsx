import './featured.scss';
import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const Featured = ({ category }) => {
    const [content, setContent] = useState(null);

    useEffect(() => {
	let isMounted = true;

	const getContent = async () => {
	    const endpoint = category
		  ? `/videos/random?category=${encodeURIComponent(category)}`
		  : '/videos/random';

	    try {
		const response = await apiClient.get(endpoint);
		const data = Array.isArray(response.data) ? response.data[0] : response.data;

		if (isMounted) {
		    setContent(data || null);
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
    }, [category]);

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

	    <img src={
		     category ?
			 content ? content.thumbnail :
			 category === 'video' ? '/drone.jpg' : '/balltech.png'
		     : '/poa.JPEG'
		 }
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
