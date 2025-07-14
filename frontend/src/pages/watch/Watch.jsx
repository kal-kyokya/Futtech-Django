import './watch.scss';
import { Link, useLocation } from 'react-router-dom';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import { useContext } from 'react';
import Navbar from '../../components/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoPlayer from '../../components/videoPlayer/VideoPlayer';

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

		<VideoPlayer
		    playbackId={ location.state?.video.content }
		    videoTitle={ location.state?.video.title }
		/>

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
