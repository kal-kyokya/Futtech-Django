import './watch.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Watch = () => {
    const location = useLocation();

    return (
	<div className='watch'>
	    <Link to='/'>
		<div className='back'>
		    <ArrowBackIcon className='arrow'/>
		    Home
		</div>
	    </Link>
	    <video className='video'
		   src={ location.state?.video || 'turf.mp4' }
		   autoPlay
		   progress
		   controls
	    />
	</div>
    );
};

export default Watch;
