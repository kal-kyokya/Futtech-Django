import './newVideo.scss';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../contexts/userContext/UserContext';
import Navbar from '../../components/Navbar';


/**
 * apiService - An instance of Axios serving as conceptual API service for
 *		making authenticated requests to our Django backend.
 *		This will handle attaching auth tokens (JWTs) to requests.
 *
 * @params {Object} config - Default config for the instance (HTTP request?).
 *
 * @returns {Axios} a customized instance of Axios.
 **/
const apiService = axios.create({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    interceptors: { // This will attach the auth token to every request
	request: (config) => {
	    const user = JSON.parse(localStorage.getItem('user'));
	    if (user && user.accessToken) {
		config.headers.Authorization = `Bearer ${user.accessToken}`;
	    }

	    return config;
	},
    },
});

const NewVideo = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    // React states matching our Django Video model
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPremium, setIsPremium] = useState(false);
    const [videoFile, setVideoFile] = useState(null);

    // React states tracking and monitoring UI/Upload status
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);

    /**
     *  handleUploadAndSubmit - Asynchronous arrow function handling the entire
     *  			upload and video creation process.
     *
     *  @params {Object} e - 'On submit event' attached to HTML form element.
     *
     *  @returns {null} - No explicit return, just a set of 'side effects'.
     **/
    const handleUploadAndSubmit = async (e) => {
	e.preventDefault(): // Prevents automatic submission of form content

	// Client-side inforcement of the Django Model's 'required fields'
	if (!videoFile || !title) {
	    setError("A title and video file are required");
	    return;
	}

	setIsUploading(true);
	setError(null); // In case there was an unsuccesful attempt
	setUploadProgress(0);

	try {
	    /**
	     * STEP 1: Create a Video record in Django & get a Mux Upload URL.
	     *
	     * _ We send our initial metadata to our backend first.
	     * _ The backend creates a 'pending' Video object and asks Mux for
	     * 	 an upload URL.
	     **/

	    const createResponse = await apiService.post('/api/videos/create-upload/',
							 {
							     title,
							     description,
							     is_premium: isPremium,
							 });

	    const { upload_url, video_id, mux_asset_id } = createResponse.data;

	    if (!upload_url) {
		throw new Error('Could not retrieve an upload URL from the server');
	    }

	    /**
	     * STEP 2: Upload the video file directly to Mux
	     *
	     * The client uploads the file to Mux. No backend operation needed.
	     **/

	    await axios.put(upload_url, videoFile, {
		headers: {
		    'Content-Type': videoFile.type,
		},
		onUploadProgress: (progressEvent) => {
		    const percent = Math.round(
			(progressEvent.loaded * 100) / progressEvent.total
		    );
		    setUploadProgress(percent);
		},
	    });

	    /**
	     * STEP 3: Finalize the upload with our backend.
	     *
	     * This confirms the upload from the client-side and can trigger
	     * post-upload workflows.
	     **/

	    await apiService.patch(`/api/videos/${video_id}/upload-complete/`,
				   {
				       mux_asset_id: mux_asset_id,
				   });

	    /**
	     * STEP 4: Navigate the user to the watch page.
	     *
	     * The video will show a 'processing' state until
	     * the Mux webhook updates the backend.
	     **/

	    navigate(`/watch/${video_id}`);

	} catch (err) {
	    console.error('Upload process failed: ', err);
	    setError('An error occured during the upload. Please try again.');
	    setIsUploading(false);
	    setUploadProgress(0);
	}
    };

    return (
	<div className='userPrompt'>
	    Upload a new Video.
	</div>
    );
};

export default NewVideo;
