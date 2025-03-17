import './watch.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation } from 'react-router-dom';

const Watch = () => {
    const { watch } = useLocation();

    return (
	<div className='watch'>
	    <Link to='/'>
		<div className='back'>
		    <ArrowBackIcon className='arrow'/>
		    Home
		</div>
	    </Link>
	    <video className='video'
		   src={ watch.video }
		   autoPlay
		   progress
		   controls
	    />
	</div>
    );
};

export default Watch;
