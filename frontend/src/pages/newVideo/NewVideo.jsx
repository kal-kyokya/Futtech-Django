import './newVideo.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import apiClient from '../../services/apiClient';

const NewVideo = () => {
    const navigate = useNavigate();

    // React states matching our Django Video model
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [isDrone, setIsDrone] = useState(false);
    const [isAiAnalysis, setIsAiAnalysis] = useState(false);

    // React states tracking and monitoring UI/Upload status
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);

    const handleUploadAndSubmit = async (e) => {
	e.preventDefault(); // Prevents automatic submission of form content

	if (!videoFile || !title) {
	    setError("A title and video file are required");
	    return;
	}

	setIsUploading(true);
	setError(null);
	setUploadProgress(0);

	try {
	    const createResponse = await apiClient.post('/video/upload/', {
		title,
		description,
		is_premium: isPremium,
		is_drone: isDrone,
		is_analysis: isAiAnalysis,
	    });

	    const { upload_url, video_id, mux_upload_id } = createResponse.data;

	    if (!upload_url) {
		throw new Error('Could not retrieve an upload URL from the server');
	    }

	    await axios.put(upload_url, videoFile, {
		headers: {
		    'Content-Type': videoFile.type,
		},
		onUploadProgress: (progressEvent) => {
		    if (!progressEvent.total) {
			return;
		    }

		    const percent = Math.round(
			(progressEvent.loaded * 100) / progressEvent.total,
		    );
		    setUploadProgress(percent);
		},
	    });

	    await apiClient.patch(`/videos/${video_id}/upload-complete/`, {
		mux_asset_id: mux_asset_id,
	    });

	    navigate(`/watch/${video_id}`);
	} catch (error) {
	    console.error('Upload process failed: ', error);
	    setError('An error occured during the upload. Please try again.');
	    setUploadProgress(0);
	} finally {
	    setIsUploading(false);
	}
    };

    return (
	<>
	    <Navbar />
	    <div className='newVideo'>
		<h1 className='newVideoTitle'>Upload New Video</h1>

		<form className='newVideoForm'
		      onSubmit={handleUploadAndSubmit}>
		    <div className='newVideoTop'>
			<div className='newVideoItem'>
			    <label>Title *</label>
			    <input className='newVideoInput'
				   type='text'
				   placeholder='Enter video title'
				   value={title}
				   onChange={(e) => setTitle(e.target.value)}
				   required
			    />
			</div>

			<div className='newVideoItem'>
			    <label>Video File *</label>
			    <input className='newVideoInput'
				   type='file'
				   accept='video/*'
				   onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
				   required
			    />
			</div>

			<div className='newVideoItem'>
			    <label>Description</label>
			    <textarea className='newVideoInputDesc'
				   placeholder='Describe your video'
				   value={description}
				   onChange={(e) => setDescription(e.target.value)}
			    />
			</div>

			<div className='newVideoItem'>
			    <label>Premium Content?</label>
			    <select className='newVideoSelect'
				   value={isPremium}
				   onChange={(e) => setIsPremium(e.target.value === 'true')}
			    >
				<option value={false}>No (Free to watch)</option>
				<option value={true}>Yes (Requires subscription)</option>
			    </select>
			</div>

			<div className='newVideoItem'>
			    <label>Drone Footage?</label>
			    <select className='newVideoSelect'
				    value={isDrone}
				    onChange={(e) => setIsDrone(e.target.value === 'true')}
			    >
				<option value='false'>No (Other media)</option>
				<option value='true'>Yes</option>
			    </select>
			</div>

			<div className='newVideoItem'>
			    <label>AI Analysis?</label>
			    <select className='newVideoSelect'
				    value={isAiAnalysis}
				    onChange={(e) => setIsAiAnalysis(e.target.value === 'true')}
			    >
				<option value='false'>No (Raw footage)</option>
				<option value='true'>Yes</option>
			    </select>
			</div>
		    </div>

		    <div className='newVideoBottom'>
			{isUploading && (
			    <div className='userPrompt'>
				<div>Uploading video: {uploadProgress}%</div>
				<progress value={uploadProgress}
					  max='100'
				>
				</progress>
			    </div>
			)}

			{error && <div className='userPrompt error'>{error}</div>}

			<button className='newVideoButton'
				type='submit'
				disabled={isUploading}
			>
			    {isUploading ? 'Uploading...' : 'Upload and Create'}
			</button>
		    </div>
		</form>
	    </div>
	</>
    );
};

export default NewVideo;
