import './video.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import DescriptionIcon from '@mui/icons-material/Description';

const Video = () => {
    const location = useLocation();
    const { video } = location.state;

    return (
	<>
	    <Navbar />

	    <div className='video'>
		<div className='videoTopSection'>
		    <h1 className='videoEditTitle'>Manage Video</h1>
		    <div className='options'>
			<Link to='/watch'
			      state={ { video } }
			      className='link'
			>
			    <button className='videoWatchButton'>
				Watch
			    </button>
			</Link>
			<button className='videoDeleteButton'
				onClick={() => dispatch(videoDelete())}
			>
			    Delete
			</button>
		    </div>
		</div>

		<div className='videoContainer'>
		    <div className='videoDetails'>

			<div className='videoDetailsTop'>
			    <img className='profile'
				 src={ video.thumbnailSmall }
				 alt='Video Thumbnail'
			    />
			    <div className='videoInfos'>
				<Link to='/watch'
				      state={ { video } }
				      className='link'
				>
				    <h2 className='videoName'>{ video.title }</h2>
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

		    <div className='videoUpdate'>
			<div className='videoUpdateTitle'>Edit</div>
			<form className='videoUpdateForm'>
			    <div className='videoUpdateTop'>
				<div className='videoUpdateItem'>
				    <label>Video Title</label>
				    <input type='text'
					   placeholder={ video.title }
					   className='videoUpdateInput'
				    />
				</div>
				<div className='videoUpdateItem'>
				    <label>Category</label>
				    <input type='text'
					   placeholder={ video.category }
					   className='videoUpdateInput'
				    />
				</div>
				<div className='videoUpdateItem'>
				    <label>Drone Footage</label>
				    <input type='text'
					   placeholder={ video.isDrone.toString() }
					   className='videoUpdateInput'
				    />
				</div>
				<div className='videoUpdateItem'>
				    <label>Location</label>
				    <input type='text'
					   placeholder={ video.location }
					   className='videoUpdateInput'
				    />
				</div>
				<div className='videoUpdateItem'>
				    <label>Description</label>
				    <input type='text'
					   placeholder={ video.desc }
					   className='videoUpdateInput'
				    />
				</div>
				<div className='videoUpdateItem'>
				    <label>Trailer</label>
				    <input type='file'
					   placeholder={ video.trailer }
					   className='videoUpdateInput'
				    />
				</div>
				<div className='videoUpdateItem'>
				    <label>Video</label>
				    <input type='file'
					   placeholder={ video.content }
					   className='videoUpdateInput'
				    />
				</div>
			    </div>

			    <div className='videoUpdateBottom'>
				<div className='videoUpdateUpload'>
				    <img className='videoUpdateImg'
					 src={ video.thumbnailSmall }
					 alt='Video Profile'
				    />
				    <label htmlFor='file'>
					<PublishIcon className='videoUpdateIcon' />
				    </label>
				    <input id='file' type='file'
					   style={{ display: 'none' }}/>
				</div>
				<button className='videoUpdateButton'>Update</button>
			    </div>
			</form>
		    </div>
		</div>
	    </div>
	</>
    );
};

export default Video;
