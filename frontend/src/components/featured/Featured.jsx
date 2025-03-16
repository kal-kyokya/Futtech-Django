import './featured.scss';

const Featured = ({ category }) => {
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
	    <img src='../../../public/poa.JPEG'
		 alt='The website owner alighting from a bus, wide smile on his face, looking straight at the photographer with his thumb up.'/>
	    <div className='info'>
		<span className='poppins-extrabold-italic'>
		    "As an active footballer, I want to review recorded footage of my games & training sessions so that I can analyze my positioning, decision-making, and off-the-ball movement to improve my game."
		</span>
	    </div>
	</div>
    );
};

export default Featured;
