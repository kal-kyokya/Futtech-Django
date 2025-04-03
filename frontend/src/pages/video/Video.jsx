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
import { useState, useContext, useEffect } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import storage from '../../firebase';
import {
    getDownloadURL,
    ref as storageRef,
    uploadBytesResumable } from 'firebase/storage';

const Video = () => {
    const location = useLocation();
    const videoId = location.pathname.split('/')[2];
    const { state } = location;

    const { videos, dispatch } = useContext(VideoContext);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [thumbnail, setThumbnail] = useState(null);
    const [url, setUrl] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploaded, setUploaded] = useState(0);
    const [prompt, setPrompt] = useState('Press to complete');

    const input = state?.input || null;
    const [video, setVideo] = useState(input);

    useEffect(() => {
	videos.filter((item) => item._id === (video?._id || input?._id) && setVideo(item));
    }, [videos]);

    const [ updatedVideo, setUpdatedVideo ] = useState({ 'owner': (video?.owner || input?.owner) });

    const firebaseUpload = (file) => {
	setIsUploading(true);

	const date = new Date().toJSON().split('.');
	const filename =  `${date}_thumbnail_${file.name.split('.')[0]}`;

	const fileRef = storageRef(storage, `futtech-files/videos/${filename}`);
	const uploadTask = uploadBytesResumable(fileRef, file);

	uploadTask.on(
	    'state_changed',
	    (snapshot) => {
		const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		console.log(progress.toFixed(0) + '% done.');
		setUploadProgress(progress.toFixed(0));
	    },
	    (err) => {
		console.error(error);
		setIsUploading(false);
	    },
	    () => {
		getDownloadURL(uploadTask.snapshot.ref)
		    .then((firebaseUrl) => {
			setUrl(firebaseUrl);
			setUpdatedVideo((prev) => {
			    return { ...prev, 'thumbnail': firebaseUrl }
			});

			setUploaded((prevCount) => prevCount + 1);
			setIsUploading(false);
		    });
	    }
	);
    };

    const handleUpload = (e) => {
	e.preventDefault();
	const file = e.target.files[0];
	setUploaded(0);
	setPrompt('Press to complete');

	if (file) {
	    setThumbnail(file);
	    firebaseUpload(file);
	}
    };

    const handleUpdate = async (e) => {
	e.preventDefault();
	dispatch(updateVideoStart());

	try {
	    await axios.put(`/videos/${video?._id || input?._id}`, updatedVideo,
					{
					    headers: {
						'auth-token': user.accessToken
					    }
					}).then((res) => {
					    dispatch(updateVideoSuccess(res.data));
					    setPrompt('Update Completed');
					    navigate(`/video/${video?._id || input?._id}`);
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
			    { isUploading ? (
				<div>
				    <div>
					Upload Progress: {uploadProgress}
				    </div>
				    <progress id='progress-bar'
					      value={uploadProgress}
					      max='100'
				    >
				    </progress>
				</div>
			    ) : (
				  <img className='profile'
				       src={ url || video?.thumbnail || input?.thumbnail }
				       alt='Video Thumbnail'
				  />
			    )}

			    <div className='videoInfos'>
				<Link to='/watch'
				      state={ { video } }
				      className='link'
				>
				    <h2 className='videoName'>{ video?.title || input?.title }</h2>
				</Link>
				<h3 className='videoCategory'>{ video?.category || input?.category }</h3>
			    </div>
			</div>

			<div className='videoDetailsBottom'>
			    <span className='videoDetailsTitle'>Video details</span>
			    <div className='videoDetailsDiv'>
				<CalendarMonthOutlinedIcon className='videoDetailsIcon' />
				<div className='videoDetailsContent'>
				    { video?.date.split('T')[0] || input?.date.split('T')[0] }
				</div>
			    </div>
			    <div className='videoDetailsDiv'>
				<LocationOnOutlinedIcon className='videoDetailsIcon' />
				<div className='videoDetailsContent'>
				    { video?.location || input?.location }
				</div>
			    </div>
			    <div className='videoDetailsDiv'>
				<DescriptionIcon className='videoDetailsIcon' />
				<div className='videoDetailsContent'>{ video?.desc || input?.desc }</div>
			    </div>
			</div>
		    </div>

		    <div className='videoUpdate'>
			<div className='videoUpdateBlock'>
			    <div className='videoUpdateTitle'>
				Edit | <Link to='/videoList'
					     style={{'color': '#028ECA'}}
				       >
					   Manage Videos
				       </Link>
			    </div>
			</div>

			<form className='videoUpdateForm'>
			    <div className='videoUpdateTop'>
				<div className='videoUpdateItem'>
				    <label>Category</label>
				    <select className='videoUpdateInput'
					    name='category'
					    id='category'
					    onChange={(e) => {
						setUpdatedVideo((prev) => {
						    return { ...prev,
							     [e.target.name]: e.target.value }
						})
					    }}
				    >
					<option>Select</option>
					<option value='Game'>Game</option>
					<option value='Training'>Training</option>
				    </select>
				</div>
				<div className='videoUpdateItem'>
				    <label>Video Title</label>
				    <input type='text'
					   placeholder={ video?.title || input?.title }
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
				    <label>Location</label>
				    <input type='text'
					   placeholder={ video?.location || input?.location }
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
				    <textarea type='text'
					   placeholder={ video?.desc || input?.desc }
					   className='videoUpdateInputDesc'
					   name='desc'
					   onChange={(e) => {
					       setUpdatedVideo((prev) => {
						   return { ...prev,
							    [e.target.name]: e.target.value }
					       })
					   }}
				    ></textarea>
				</div>
			    </div>

			    <div className='videoUpdateBottom'>
				<div className='videoUpdateUpload'>
				    { isUploading ? (
					<div>
					    <div>
						Upload Progress: {uploadProgress}
					    </div>
					    <progress id='progress-bar'
						      value={uploadProgress}
						      max='100'
					    >
					    </progress>
					</div>
				    ) : (
					<>
					    <img className='videoUpdateImg'
						 src={ url || video?.thumbnail || input?.thumbnail }
						 alt='Video Thumbnail'
					    />
					    <label htmlFor='file'>
						<PublishIcon className='videoUpdateIcon' />
					    </label>
					    <input id='file'
						   type='file'
						   style={{ display: 'none' }}
						   name='thumbnail'
						   onChange={handleUpload}
					    />
					</>
				    )}
				</div>
				{ uploaded === 1 && (
				    <div className='userPrompt'>
					{ prompt }
				    </div>
				)}

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
