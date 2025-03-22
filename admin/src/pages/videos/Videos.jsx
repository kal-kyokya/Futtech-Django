import './videos.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import { Link, useLocation } from 'react-router-dom';

const Video = () => {
    const { video } = useLocation();

    return (
	<div className='video'>
	    <div className='videoTopSection'>
		<h1 className='videoEditTitle'>Manage Video</h1>
		<Link to='/newVideo'>
		    <button className='videoCreateButton'>Create video</button>
		</Link>
	    </div>

	    <div className='videoContainer'>
		<div className='videoDetails'>

		    <div className='videoDetailsTop'>
			<img className='profile'
			     src='{movie.thumbnailSmall}'
			     alt='Video Thumbnail'
			/>
			<div className='videoInfos'>
			    <div className='videoName'>{ 'video.title' }</div>
			    <div className='videoCategory'>{ 'video.category' }</div>
			</div>
		    </div>

		    <div className='videoDetailsBottom'>
			<span className='videoDetailsTitle'>Video details</span>
			<div className='videoDetailsDiv'>
			    <CalendarMonthOutlinedIcon className='videoDetailsIcon' />
			    <div className='videoDetailsContent'>{ 'video.date' }</div>
			</div>
			<div className='videoDetailsDiv'>
			    <PermIdentityIcon className='videoDetailsIcon' />
			    <div className='videoDetailsContent'>{ 'video.isDrone' }</div>
			</div>
			<div className='videoDetailsDiv'>
			    <SportsSoccerIcon className='videoDetailsIcon' />
			    <div className='videoDetailsContent'>{ 'video.desc' }</div>
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
				       placeholder={'video.title'}
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Category</label>
				<input type='text'
				       placeholder={'video.category'}
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Drone Footage</label>
				<input type='text'
				       placeholder={'video.isDrone'}
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Location</label>
				<input type='text'
				       placeholder='Nairobi | Kenya'
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Description</label>
				<input type='text'
				       placeholder={'video.desc'}
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Trailer</label>
				<input type='file'
				       placeholder={'video.trailer'}
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Video</label>
				<input type='file'
				       placeholder={'video.video'}
				       className='videoUpdateInput'
				/>
			    </div>
			</div>

			<div className='videoUpdateBottom'>
			    <div className='videoUpdateUpload'>
				<img className='videoUpdateImg'
				     src='/logo.png'
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
    );
};

export default Video;
