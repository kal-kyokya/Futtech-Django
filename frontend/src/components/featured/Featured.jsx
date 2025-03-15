import './featured.scss';

const Featured = ({ type }) => {
    return (
	<div className='featured'>
	    {type &&
	     <div className='category'>
		 <span>{ type === 'drone' ? 'Footages' : 'Analysis' }</span>
		 <select name='type' id='type'>
		     <option>Types</option>
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
