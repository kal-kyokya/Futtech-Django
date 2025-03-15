import './watch.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Watch = () => {
    return (
	<div className='watch'>
	    <div className='back'>
		<ArrowBackIcon className='arrow'/>
		Home
	    </div>
	    <video className='video'
		   src='../../../public/turf.mp4'
		   autoPlay
		   progress
		   controls
	    />
	</div>
    );
};

export default Watch;
