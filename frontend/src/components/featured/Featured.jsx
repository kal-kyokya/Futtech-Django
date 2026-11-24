import './featured.scss';

const Featured = ({ category }) => {
    return (
	<div className='featured'>
	    {category && (
		<div className='category'>
		    <span>
			{category !== 'drone'
			 ? category === 'videos'
			 ? 'Footages'
			 : 'Analysis'
			 : 'Drone views'}
		    </span>
		    <select name='category' id='category'>
			<option>Categories</option>
			<option value='training'>Training</option>
			<option value='game'>Games</option>
		    </select>
		</div>
	    )}

	    <img
		src='https://vz-6d210aca-5d4.b-cdn.net/d9aef4c4-9009-4657-92b7-cd023d91c5d0/thumbnail_5d7f0d0a.jpg'
		alt="Featured section's image"
	    />

	    <div className='info'>
		<span className='poppins-extrabold-italic'>
		    {category !== 'videos' ? (
			category === 'drone' ? (
			    <h4>
				<i>
				    Bird’s-eye tactical view of players&#39; decision-making,
				    off-the-ball movement and positioning—for post-training and
				    post-game analysis.
				</i>
			    </h4>
			) : (
			    <h4>
				<i>
				    Processed training and game footage—highlighting areas of
				    improvements in team formations, tactics, player movements,
				    and decision-making.
				</i>
			    </h4>
			)
		    ) : (
			<h4>
			    <i>
				As an active footballer, I want to review footage of my games &
				training sessions. Analyze my: positioning, off-the-ball
				movement, decision-making and improve my game.
			    </i>
			</h4>
		    )}
		</span>
	    </div>
	</div>
    );
};

export default Featured;
