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
		<Link to='/videoList'>
		    <div className='icon'>
			<ArrowBackIcon className='arrow'/>
			Videos
		    </div>
		</Link>

		<Link to='/'>
		    <div className='icon'>
			<ArrowForwardIcon className='arrow'/>
			Home
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
