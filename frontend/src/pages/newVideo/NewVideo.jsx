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
 */
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
     */
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

	} catch (err) {

	}
    };

    return (
	<div className='userPrompt'>
	    Upload a new Video.
	</div>
    );
};

export default NewVideo;
