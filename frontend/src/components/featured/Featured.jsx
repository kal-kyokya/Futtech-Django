import './featured.scss';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/userContext/UserContext';

const Featured = ({ category }) => {
    const [content, setContent] = useState(null);
    const { user } = useContext(UserContext);

    useEffect(() => {
	const getContent = async () => {
	    const res = await axios.get(`/videos/random?category=${ category }`, {
		headers: {
		    'auth-token': user.accessToken
		}
	    }).then((res) => {
		setContent(res.data[0]);
	    }).catch((err) => {
		console.log(err);
	    });
	}

	getContent();
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
		      <h4><i>Bird’s-eye tactical view of players and team decision-making, off-the-ball movement, and positioning—for post-training and post-game analysis.</i></h4> :
		      <h4><i>Processed training and game footage—highlighting areas of improvements in team formations, tactics, player movements, and decision-making.</i></h4>
		      : <h4><i>As an active footballer, I want to review footage of my games & training sessions. Analyze my: positioning, off-the-ball movement, decision-making and improve my game.</i></h4> }
		</span>
	    </div>
	</div>
    );
};

export default Featured;
