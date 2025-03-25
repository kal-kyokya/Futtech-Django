import './featured.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Featured = ({ category }) => {
    const [content, setContent] = useState();

    useEffect(() => {
	const getContent = async () => {
	    try {
		const res = await axios.get(`/videos/random?category=${ category }`, {
		    headers: {
			token: ''
		    }
		});
		setContent(res.data[0]);
	    } catch (err) {
		console.log(err);
	    }
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

	    <img src={ category ? content.thumbnail : '/poa.JPEG' }/>
	    <div className='info'>
		<span className='poppins-extrabold-italic'>
		    { 'content.desc' || '' }
		</span>
	    </div>
	</div>
    );
};

export default Featured;
