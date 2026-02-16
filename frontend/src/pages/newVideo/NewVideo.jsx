import './newVideo.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
	    setError('A title and video file are required');
	    return;
	}

	setIsUploading(true);
	setError(null);
	setUploadProgress(0);

	try {
	    const formData = new FormData();
	    formData.append('title', title);
	    formData.append('description', description);
	    formData.append('is_premium', String(isPremium));
	    formData.append('is_drone', String(isDrone));
	    formData.append('is_analysis', String(isAiAnalysis));
	    formData.append('file', videoFile);

	    const createResponse = await apiClient.post('/video/upload/', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
		onUploadProgress: (progressEvent) => {
		    if (!progressEvent.total) {
			return;
		    }

		    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
		    setUploadProgress(percent);
		},
	    });

	    navigate(`/watch/${createResponse.data.video_id}`);
	} catch (uploadError) {
	    console.error('Upload process failed: ', uploadError);
	    setError(uploadError?.response?.error || 'An error occured during the upload. Please try again.');
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
