import './newVideo.scss';
import { useState, useContext } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import storage from '../../firebase';
import Navbar from '../../components/Navbar';
import {
    getDownloadURL,
    ref as storageRef,
    uploadBytesResumable } from 'firebase/storage';
import {
    createVideoStart,
    createVideoSuccess,
    createVideoFailure } from '../../contexts/videoContext/VideoActions';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewVideo = () => {
    const { dispatch } = useContext(VideoContext);
    const { user } = useContext(UserContext);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const [video, setVideo] = useState({ 'owner': user._id });
    const [content, setContent] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [uploaded, setUploaded] = useState(0);
    const [contentIsUploading, setContentIsUploading] = useState(false);
    const [imgIsUploading, setImgIsUploading] = useState(false);
    const [contentUploadProgress, setContentUploadProgress] = useState(0);
    const [imgUploadProgress, setImgUploadProgress] = useState(0);
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState(null);
    const [playbackId, setPlaybackId] = useState(null);

    const handleChange = (e) => {
	setVideo((prevVideo) => {
	    return { ...prevVideo, [e.target.name]: e.target.value };
	});
    };

    const firebaseUpload = (input) => {
	setImgIsUploading(true);

	const date = new Date().toJSON().split('.');
	const filename =  `${date}_${input.name}_${input.file.name}`;

	const fileRef = storageRef(storage, `futtech-files/videos/${filename}`);
	const uploadTask = uploadBytesResumable(fileRef, input.file);

	uploadTask.on(
	    'state_changed',
	    (snapshot) => {
		const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		setImgUploadProgress(progress.toFixed(0));
	    },
	    (err) => {
		console.error(error);
		setIsUploading(false);
	    },
	    () => {
		getDownloadURL(uploadTask.snapshot.ref)
		    .then((firebaseUrl) => {
			setVideo((prev) => {
			    return { ...prev, [input.name]: firebaseUrl }
			});

			setUploaded((prevCount) => prevCount + 1);
			setImgIsUploading(false);
			console.log(uploaded);
		    });
	    }
	);

    };

    const pollForPlaybackId = (uploadId) => {
	if (!uploadId) {
	    console.error('No Upload ID - ', uploadId);
	    return;
	}

	const interval = setInterval(async () => {
	    try {
		const res = await axios.get(`${baseURL}/videos/playback/${uploadId}`,
					    {
						headers: {
						    'auth-token': user.accessToken,
						}
					    });

		setPlaybackId(res.data.playbackId);
		setVideo((prevVideo) => {
		    return { ...prevVideo, 'content': playbackId };
		});

		setUploaded((prevCount) => prevCount + 1);
		clearInterval(interval);
		setContentIsUploading(false);
		console.log(uploaded);
	    } catch (err) {
		console.error('Polling error: ', err);
	    }
	}, 5000);
    };

    const handleUpload = async (e) => {
	e.preventDefault();

	if (thumbnail && imgUploadProgress === 0) {
	    firebaseUpload({ file: thumbnail, name: 'thumbnail' });
	}

	if (content && contentUploadProgress === 0) {
	    setContentIsUploading(true);

	    try {
		// Get Mux upload URL
		const muxRes = await axios.post(`${baseURL}/videos/mux`, { data: {} },
						{
						    headers: {
							'auth-token': user.accessToken,
						    }
						});
		console.log(muxRes);
		const { uploadUrl, uploadId } = muxRes.data;

		// Upload video to Mux
		await axios.put(uploadUrl, content, {
		    headers: {
			'Content-Type': content.type,
		    },
		    onUploadProgress: (progressEvent) => {
			const percent = Math.round(
			    (progressEvent.loaded * 100) / progressEvent.total
			);
			setContentUploadProgress(percent);
		    },
		});

		pollForPlaybackId(uploadId);
	    } catch (err) {
		console.error('Upload to Mux error:', err);
	    } finally {
		setContentIsUploading(false);
	    }
	}
    };

    const handleSubmit = async (e) => {
	e.preventDefault();
	dispatch(createVideoStart());

	try {
	    const res = await axios.post(`${baseURL}/videos`, video,
					 {
					     headers: {
						 'auth-token': user.accessToken,
					     }
					 });
	    dispatch(createVideoSuccess(res.data));
	    navigate('/watch', { state: { video: res.data } });
	} catch (err) {
	    err.response.data.error.keyValue && setPrompt(err.response.data.error.keyValue);

	    console.error(err);
	    dispatch(createVideoFailure());
	}
    };

    return (
	<>
	    <Navbar />
	    <div className='newVideo'>
		<h1 className='newVideoTitle'>New Video</h1>

		<form className='newVideoForm'>
		    <div className='newVideoTop'>
			<div className='newVideoItem'>
			    <label>Title</label>
			    <input type='text'
				   placeholder={ 'video.title' }
				   className='newVideoInput'
				   name='title'
				   onChange={handleChange}
			    />
			</div>
			<div className='newVideoItem'>
			    <label>Location</label>
			    <input type='text'
				   placeholder={ 'video.location' }
				   className='newVideoInput'
				   name='location'
				   onChange={handleChange}
			    />
			</div>
			<div className='newVideoItem'>
			    <label>Date</label>
			    <input type='date'
				   className='newVideoInput'
				   name='date'
				   onChange={handleChange}
				   
			    />
			</div>
			<div className='newVideoItem'>
			    <label>Category</label>
			    <select className='newVideoSelect'
				    name='category'
				    onChange={handleChange}
				    id='category'
			    >
				<option>Select</option>
				<option value='Game'>Game</option>
				<option value='Training'>Training</option>
			    </select>
			</div>
			<div className='newVideoItem'>
			    <label>Drone Footage?</label>
			    <select className='newVideoSelect'
				    name='isDrone'
				    onChange={handleChange}
				    id='isDrone'
			    >
				<option>Select</option>
				<option value='Yes'>Yes</option>
				<option value='No'>No</option>
			    </select>
			</div>
			<div className='newVideoItem'>
			    <label>AI Analysis?</label>
			    <select className='newVideoSelect'
				    name='isAiAnalysis'
				    onChange={handleChange}
				    id='isAiAnalysis'
			    >
				<option>Select</option>
				<option value='Yes'>Yes</option>
				<option value='No'>No</option>
			    </select>
			</div>

			<div className='newVideoItem'>
			    <label>Thumbnail</label>
			    <input type='file'
				   id='thumbnail'
				   name='thumbnail'
				   onChange={(e) => setThumbnail(e.target.files[0])}
				   className='newVideoInput'
			    />
			</div>
			<div className='newVideoItem'>
			    <label>Video</label>
			    <input type='file'
				   accept='video/*'
				   id='content'
				   name='content'
				   onChange={(e) => setContent(e.target.files[0])}
				   className='newVideoInput'
			    />
			</div>
			<div className='newVideoItem'>
			    <label>Description</label>
			    <textarea type='text'
				      placeholder={ 'video.description' }
				      className='newVideoInputDesc'
				      name='desc'
				      onChange={handleChange}
			    />
			</div>
		    </div>

		    <div className='newVideoBottom'>
			{ contentUploadProgress !== 100 && imgUploadProgress !== 100 && (
			    <div className='userPrompt'>
				Ensure you upload files
			    </div>
			)}

			{ imgIsUploading && (
			    <div className='userPrompt'>
				<div>
				    Uploading thumbnail: {imgUploadProgress}%
				</div>
				<progress value={imgUploadProgress}
					  max='100'
				>
				</progress>
			    </div>
			)}

			{ contentIsUploading && (
			    <div className='userPrompt'>
				<div>
				    Uploading video: {contentUploadProgress}%
				</div>
				<progress value={contentUploadProgress}
					  max='100'
				>
				</progress>
			    </div>
			)}

			{ prompt && (
			    <div className='userPrompt'>
				"{ prompt.title }" already taken.
			    </div>
			)}

			{uploaded !== 2 ? (
			    <button className='uploadButton'
				    onClick={handleUpload}
			    >
				File Uploaded ({uploaded})
			    </button>
			) : (
			    <div>
				<button className='newVideoButton'
					onClick={handleSubmit}
				>
				    Create video
				</button>
			    </div>
			)}
		    </div>
		</form>

	    </div>
	</>
    );
};

export default NewVideo;
