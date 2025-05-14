import './watch.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link, useLocation } from 'react-router-dom';
import { useContext, lazy, Suspense } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import Navbar from '../../components/Navbar';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import DescriptionIcon from '@mui/icons-material/Description';

const MuxPlayer = lazy(() => import('@mux/mux-player-react'));

const Watch = () => {
    const location = useLocation();
    const { video, origin } = location.state;
    const { videos } = useContext(VideoContext);

    return (
	<>
	    <div className='watch'>
		<div className='options'>
		    <Link className='link'
			  to={ origin === 'list' ? '/' : '/videoList' }
		    >
			<div className='iconLeft'>
			    <ArrowBackIcon className='arrow'/>
			    { origin === 'list' ? <span>Home</span> : <span>Videos</span> }
			</div>
		    </Link>

		    <Link className='link'
			  to={ origin === 'list' ? '/videoList' : '/' }
		    >
			<div className='iconRight'>
			    { origin === 'list' ? <span>Videos</span> : <span>Home</span> }
			    <ArrowForwardIcon className='arrow'/>
			</div>
		    </Link>
		</div>

		<Suspense fallback={ <div>Loading video player...</div> }>
		    <MuxPlayer
			playbackId={ location.state?.video.content }
			streamType='on-demand'
			primaryColor='#0D1C23'
			controls
		    />
		</Suspense>

		<div className='videoContainer'>
		    <div className='videoDetails'>

			<div className='videoDetailsTop'>
			    <img className='profile'
				 src={ video.thumbnail }
				 alt='Video Thumbnail'
			    />
			    <div className='videoInfos'>
				<Link to={ '/video/' + video._id }
				      state={ { 'input': video } }
				      className='link'
				>
				    <h2 className='videoName'>
					<u>{ video.title }</u>
				    </h2>
				</Link>
				<h3 className='videoCategory'>{ video.category }</h3>
			    </div>
			</div>

			<div className='videoDetailsBottom'>
			    <span className='videoDetailsTitle'>Video details</span>
			    <div className='videoDetailsDiv'>
				<CalendarMonthOutlinedIcon className='videoDetailsIcon' />
				<div className='videoDetailsContent'>
				    { video.date.split('T')[0] }
				</div>
			    </div>
			    <div className='videoDetailsDiv'>
				<LocationOnOutlinedIcon className='videoDetailsIcon' />
				<div className='videoDetailsContent'>
				    { video.location }
				</div>
			    </div>
			    <div className='videoDetailsDiv'>
				<DescriptionIcon className='videoDetailsIcon' />
				<div className='videoDetailsContent'>{ video.desc }</div>
			    </div>
			</div>
		    </div>
		</div>
	    </div>
	</>
    );
};

export default Watch;
