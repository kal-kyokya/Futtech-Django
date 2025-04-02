import './video.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import {
    updateVideoStart, updateVideoSuccess, updateVideoFailure
} from '../../contexts/videoContext/VideoActions';
import { useState, useContext } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import { UserContext } from '../../contexts/userContext/UserContext';

const Video = () => {
    const location = useLocation();
    const { video } = location.state;
    const { dispatch } = useContext(VideoContext);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [ updatedVideo, setUpdatedVideo ] = useState({ 'owner': video.owner });

    const handleUpdate = async (e) => {
	e.preventDefault();
	dispatch(updateVideoStart());

	try {
	    await axios.put(`/videos/${video._id}`, updatedVideo,
					{
					    headers: {
						'auth-token': user.accessToken
					    }
					}).then((res) => {
					    dispatch(updateVideoSuccess(res.data));
					    navigate('/videoList');
					});

	} catch (err) {
	    console.error(err);
	    dispatch(updateVideoFailure());
	}
    };

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
					   name='title'
					   onChange={(e) => {
					       setUpdatedVideo((prev) => {
						   return { ...prev,
							    [e.target.name]: e.target.value }
					       })
					   }}
				    />
				</div>
				<div className='videoUpdateItem'>
				    <label>Category</label>
				    <input type='text'
					   placeholder={ video.category }
					   className='videoUpdateInput'
					   name='category'
					   onChange={(e) => {
					       setUpdatedVideo((prev) => {
						   return { ...prev,
							    [e.target.name]: e.target.value }
					       })
					   }}
				    />
				</div>
				<div className='videoUpdateItem'>
				    <label>Drone Footage</label>
				    <select className='videoUpdateInput'
					    name='isDrone'
					    onChange={(e) => {
						setUpdatedVideo((prev) => {
						    return { ...prev,
							     [e.target.name]: e.target.value
							   }
						})
					    }}
				    >
					<option>Select</option>
					<option value='Yes'>Yes</option>
					<option value='No'>No</option>
				    </select>
				</div>
				<div className='videoUpdateItem'>
				    <label>Location</label>
				    <input type='text'
					   placeholder={ video.location }
					   className='videoUpdateInput'
					   name='location'
					   onChange={(e) => {
					       setUpdatedVideo((prev) => {
						   return { ...prev,
							    [e.target.name]: e.target.value }
					       })
					   }}
				    />
				</div>
				<div className='videoUpdateItem'>
				    <label>Description</label>
				    <input type='text'
					   placeholder={ video.desc }
					   className='videoUpdateInput'
					   name='desc'
					   onChange={(e) => {
					       setUpdatedVideo((prev) => {
						   return { ...prev,
							    [e.target.name]: e.target.value }
					       })
					   }}
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
				<button className='videoUpdateButton'
					onClick={(e) => handleUpdate(e)}>Update</button>
			    </div>
			</form>
		    </div>
		</div>
	    </div>
	</>
    );
};

export default Video;
