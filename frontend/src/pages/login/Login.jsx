import './login.scss';
import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/authContext/AuthContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import axios from 'axios';
import {
    loginStart, loginSuccess, loginFailure } from '../../contexts/authContext/AuthActions';
import { signinSuccess } from '../../contexts/userContext/UserActions';
import { useNavigate, Link } from 'react-router-dom';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import {
    getVideosStart, getVideosSuccess, getVideosFailure,
} from '../../contexts/videoContext/VideoActions';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { dispatch, isFetching, error: resError } = useContext(AuthContext);
    const navigate = useNavigate();
    const { loggedOut, dispatch: userDispatch } = useContext(UserContext);
    const { dispatch: videoDispatch } = useContext(VideoContext);

    const handleSignIn = async (e) => {
	e.preventDefault(); // Prevent form reload and allow data submission
	dispatch(loginStart());
	videoDispatch(getVideosStart());

	await axios.post(
	    'http://127.0.0.1:8080/auth/signIn',
	    { email, password },
	    { headers: {'content-type': 'application/json'} }
	).then((userRes) => {
	    const getVideos = async () => {
		videoDispatch(getVideosStart());

		try {
		    const res = await axios.get('/videos/all', {
			headers: {
			    'auth-token': userRes.data.accessToken,
			}
		    });

		    videoDispatch(getVideosSuccess(res.data));
		} catch (err) {
		    console.error(err);
		    videoDispatch(getVideosFailure());
		}
	    };

	    getVideos();
	    dispatch(loginSuccess(userRes.data));
	    userDispatch(signinSuccess(userRes.data));
	}).catch((err) => {
	    console.log(err.response.data.error);
	    dispatch(loginFailure(err.response.data));
	}).finally(() => {
	    navigate('/user', { replace: true });
	});
    };

    return (
	<div className='login'>
	    <div className='top'>
		<img
		    className='logo'
		    src='../../../public/logo.png'
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

		    {resError && (
			<div className='userPrompt'>
			    {resError.error}.
			</div>
		    )}

		    {loggedOut && (
			<div className='userPrompt'>
			    You have been successfully logged out.
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
