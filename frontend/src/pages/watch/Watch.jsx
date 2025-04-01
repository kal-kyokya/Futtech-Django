import './watch.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';

const Watch = () => {
    const location = useLocation();
    const { videos } = useContext(VideoContext);

    return (
	<div className='watch'>
	    <div className='options'>
		<Link className='link' to='/videoList'>
		    <div className='iconLeft'>
			<ArrowBackIcon className='arrow'/>
			Videos
		    </div>
		</Link>

		<Link className='link' to='/'>
		    <div className='iconRight'>
			Home
			<ArrowForwardIcon className='arrow'/>
		    </div>
		</Link>
	    </div>
	    <video className='video'
		   src={ location.state?.video || videos[0].content || 'turf.mp4' }
		   autoPlay
		   progress
		   controls
	    />
	</div>
    );
};

export default Watch;
