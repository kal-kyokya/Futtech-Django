import './login.scss';
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/authContext/AuthContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import { ListContext } from '../../contexts/listContext/ListContext';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import {
    loginStart,
    loginSuccess,
    loginFailure } from '../../contexts/authContext/AuthActions';
import {
    updateStart,
    updateSuccess,
    updateFailure } from '../../contexts/userContext/UserActions';
import {
    getVideosStart,
    getVideosSuccess,
    getVideosFailure } from '../../contexts/videoContext/VideoActions';
import {
    getListsStart,
    getListsSuccess,
    getListsFailure } from '../../contexts/listContext/ListActions';
import authService from '../../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { dispatch,
	    isFetching,
	    loggedOut,
	    error: loginError } = useContext(AuthContext);

    const { dispatch: videoDispatch } = useContext(VideoContext);
    const { dispatch: listDispatch } = useContext(ListContext);
    const { dispatch: userDispatch } = useContext(UserContext);

    const navigate = useNavigate();

    const handleSignIn = async (e) => {
	e.preventDefault(); // Prevents form reload and allows data submission

	dispatch(loginStart());
	userDispatch(updateStart());
	videoDispatch(getVideosStart());
	listDispatch(getListsStart());

	try {
	    const result = await authService.login({ email, password });

	    if (!result.success) {
		throw new Error(result.error || 'Login failed');
	    }

	    dispatch(loginSuccess(result.user));
	    dispatch(updateSuccess(result.user));

	    if (result.playlistsPromise) {
		try {
		    const { playlists, featured } = await result.playlistsPromise;
		    if (Array.isArray(featured)) {
			videoDispatch(getVideosSuccess(featured));
		    } else {
			videoDispatch(getVideosSuccess(featured?.results ?? []));
		    }

		    if (Array.isArray(playlists)) {
			listDispatch(getListsSuccess(playlists));
		    } else {
			listDispatch(getListsSuccess(playlists?.results ?? []));
		    }
		} catch (contentError) {
		    console.error('Failed to load initial content: ', contentError);
		    videoDispatch(getVideosFailure());
		    listDispatch(getListsFailure());
		}
	    } else {
		videoDispatch(getVideosSuccess([]));
		listDispatch(getListsSuccess([]));
	    }

	    navigate('/', { replace: true });
	} catch (error) {
	    console.error('Login failed: ', error);
	    dispatch(loginFailure({ error: error.message }));
	    userDispatch(updateFailure({ error: error.message }));
	    videoDispatch(getVideosFailure());
	    listDispatch(getListsFailure());
	}
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
