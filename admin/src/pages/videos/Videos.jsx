import './video.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import { Link } from 'react-router-dom';

const Video = () => {
    return (
	<div className='video'>
	    <div className='videoTopSection'>
		<h1 className='videoEditTitle'>Video Profile</h1>
		<Link to='/newVideo'>
		    <button className='videoCreateButton'>Create video</button>
		</Link>
	    </div>

	    <div className='videoContainer'>
		<div className='videoDetails'>

		    <div className='videoDetailsTop'>
			<img className='profile'
			     src='https://raw.githubvideocontent.com/kal-kyokya/react-admin-panel/refs/heads/main/public/profile1.JPG'
			     alt='Profile Pic'
			/>
			<div className='videoInfos'>
			    <div className='videoNames'>Jean-Paul KYOKYA</div>
			    <div className='videoTitle'>Software Engineer</div>
			</div>
		    </div>

		    <div className='videoDetailsBottom'>
			<span className='videoDetailsTitle'>Account details</span>
			<div className='videoDetailsDiv'>
			    <SportsSoccerIcon className='videoDetailsIcon' />
			    <div className='videoDetailsContent'>Striker</div>
			</div>
			<div className='videoDetailsDiv'>
			    <PermIdentityIcon className='videoDetailsIcon' />
			    <div className='videoDetailsContent'>kal-kyokya</div>
			</div>
			<div className='videoDetailsDiv'>
			    <CalendarMonthOutlinedIcon className='videoDetailsIcon' />
			    <div className='videoDetailsContent'>15.03.1999</div>
			</div>
			<span className='videoDetailsTitle'>Contact details</span>
			<div className='videoDetailsDiv'>
			    <EmailOutlinedIcon className='videoDetailsIcon' />
			    <div className='videoDetailsContent'>kalkyokya4@gmail.com</div>
			</div>
			<div className='videoDetailsDiv'>
			    <LocalPhoneOutlinedIcon className='videoDetailsIcon' />
			    <div className='videoDetailsContent'>+254798129095</div>
			</div>
			<div className='videoDetailsDiv'>
			    <LocationOnOutlinedIcon className='videoDetailsIcon' />
			    <div className='videoDetailsContent'>Nairobi | Kenya</div>
			</div>
		    </div>
		</div>

		<div className='videoUpdate'>
		    <div className='videoUpdateTitle'>Edit</div>
		    <form className='videoUpdateForm'>
			<div className='videoUpdateLeft'>
			    <div className='videoUpdateItem'>
				<label>Full Name</label>
				<input type='text'
				       placeholder='Jean-Paul KYOKYA'
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Profession</label>
				<input type='text'
				       placeholder='Software Engineer'
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Position</label>
				<input type='text'
				       placeholder='Striker'
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Videoname</label>
				<input type='text'
				       placeholder='kal-kyokya'
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Email</label>
				<input type='email'
				       placeholder='kalkyokya4@gmail.com'
				       className='videoUpdateInput'
				/>
			    </div>
			    <div className='videoUpdateItem'>
				<label>Phone</label>
				<input type='text'
				       placeholder='+254798129095'
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
			</div>

			<div className='videoUpdateRight'>
			    <div className='videoUpdateUpload'>
				<img className='videoUpdateImg'
				     src='https://raw.githubvideocontent.com/kal-kyokya/react-admin-panel/refs/heads/main/public/profile1.JPG'
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
