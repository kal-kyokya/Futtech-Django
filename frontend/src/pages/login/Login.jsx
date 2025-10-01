import './login.scss';
import axios from 'axios';
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/authContext/AuthContext';
import { ListContext } from '../../contexts/listContext/ListContext';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import {
    loginStart,
    loginSuccess,
    loginFailure } from '../../contexts/authContext/AuthActions';
import {
    getVideosStart,
    getVideosSuccess,
    getVideosFailure } from '../../contexts/videoContext/VideoActions';
import {
    getListsStart,
    getListsSuccess,
    getListsFailure } from '../../contexts/listContext/ListActions';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { dispatch,
	    isFetching,
	    loggedOut,
	    error: loginError } = useContext(AuthContext);

    const { dispatch: videoDispatch } = useContext(VideoContext);
    const { dispatch: listDispatch } = useContext(ListContext);

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const handleSignIn = async (e) => {
	e.preventDefault(); // Prevents form reload and allows data submission
	dispatch(loginStart());
	videoDispatch(getVideosStart());
	listDispatch(getListsStart());

	await axios.post(
	    `${baseURL}/auth/login`,
	    { email, password },
	    { headers: {'content-type': 'application/json'} }
	).then((userRes) => {
	    const getVideos = async () => {
		videoDispatch(getVideosStart());

		try {
		    const res = await axios.get(`${baseURL}/`, {
			headers: {
			    'auth-token': userRes.data.accessToken,
			}
		    });
		    console.log(res);

		    videoDispatch(getVideosSuccess(res.data));
		} catch (err) {
		    console.error(err);
		    videoDispatch(getVideosFailure());
		}
	    };

	    const getLists = async () => {
		listDispatch(getListsStart());

		try {
		    const res = await axios.get(`${baseURL}/lists`, {
			headers: {
			    'auth-token': userRes.data.accessToken,
			}
		    });

		    listDispatch(getListsSuccess(res.data));
		} catch (err) {
		    console.error(err);
		    listDispatch(getListsFailure());
		}
	    };

	    getVideos();
	    getLists();
	    dispatch(loginSuccess(userRes.data));
	    userDispatch(signinSuccess(userRes.data));
	}).catch((err) => {
	    console.log(err.response.data.error);
	    dispatch(loginFailure(err.response.data));
	}).finally(() => {
	    const navigate = useNavigate();
	    navigate('/user', { replace: true });
	});
    };

    return (
	<div className='login'>
	    <div className='top'>
		<img
		    className='logo'
		    src='/logo.png'
		    alt='Logo of the Futtech Company'
		/>
	    </div>

	    <div className='container'>
		<form>
		    <h1>Sign In</h1>
		    <input type='email'
			   placeholder='Email address'
			   onChange={(e) => setEmail(e.target.value)}
		    />
		    <input type='password'
			   placeholder='Password'
			   autoComplete='Password'
			   onChange={(e) => setPassword(e.target.value)}
		    />

		    <button onClick={handleSignIn} disabled={isFetching}>
			Sign In
		    </button>

		    {loginError && (
			<div className='userPrompt'>
			    {loginError.error}.
			</div>
		    )}

		    <span className='resetPassword'>
			<Link to='/reset-password' className='link'>
			    <u>Forgot Password?</u>
			</Link>
		    </span>

		    <span className='text'>
			New to Futtech? Sign up 
			<Link to='/register' className='link'>
				<b> <u>here</u></b>.
			</Link>
		    </span>

		    <div className='captcha'>
			<p className='small-1'>
			    <i>This page is protected by Google reCAPTCHA to ensure you're not a bot.</i>
			</p>

			<p className='small-2'>
			    <i>Learn more.</i>
			</p>
		    </div>
		</form>
	    </div>
	</div>
    );
};

export default Login;
