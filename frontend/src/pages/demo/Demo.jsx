import './demo.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';

const Demo = () => {
    return (
	<div className='demo'>
	    <Link to='/'>
		<div className='back'>
		    <ArrowBackIcon className='arrow'/>
		    Home
		</div>
	    </Link>
	    <video className='video'
		   src='turf.mp4'
		   autoPlay
		   progress
		   controls
	    />
	</div>
    );
};

export default Demo;
