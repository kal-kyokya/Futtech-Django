import './login.scss';
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/authContext/AuthContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import { PlaylistContext } from '../../contexts/playlistContext/PlaylistContext';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import {
    loginStart,
    loginSuccess,
    loginFailure,
    clearAuthError } from '../../contexts/authContext/AuthActions';
import {
    updateStart,
    updateSuccess,
    updateFailure } from '../../contexts/userContext/UserActions';
import {
    getVideosStart,
    getVideosSuccess,
    getVideosFailure } from '../../contexts/videoContext/VideoActions';
import {
    getPlaylistsStart,
    getPlaylistsSuccess,
    getPlaylistsFailure } from '../../contexts/playlistContext/PlaylistActions';
import authService from '../../services/authService';
import { normalizeError } from '../../services/apiClient';
import AuthLayout from '../../components/auth/AuthLayout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { dispatch: authDispatch,
	    isFetching,
	    loggedOut,
	    error: loginError } = useContext(AuthContext);

    const { dispatch: videoDispatch } = useContext(VideoContext);
    const { dispatch: playlistDispatch } = useContext(PlaylistContext);
    const { dispatch: userDispatch } = useContext(UserContext);

    const navigate = useNavigate();
    const location = useLocation();
    const fieldErrors = loginError?.fields || {};
    const [notice, setNotice] = useState('');

    useEffect(() => (
	() => authDispatch(clearAuthError())
    ), [authDispatch]);

    useEffect(() => {
	if (location.state?.notice) {
	    setNotice(location.state.notice);
	    navigate(location.pathname, { replace: true, state: {} });
	}
    }, [location.state, location.pathname, navigate]);

    const handleSignIn = async (e) => {
	e.preventDefault(); // Prevents form reload and allows data submission

	authDispatch(loginStart());
	userDispatch(updateStart());
	videoDispatch(getVideosStart());
	playlistDispatch(getPlaylistsStart());

	try {
	    const result = await authService.login({ email, password });

	    if (!result.success) {
		const normalizedError = result.error || normalizeError(new Error('Login failed'));
		authDispatch(loginFailure(normalizedError));
		userDispatch(updateFailure(normalizedError));
		videoDispatch(getVideosFailure());
		playlistDispatch(getPlaylistsFailure());
		return;
	    }

	    authDispatch(loginSuccess(result.user));
	    userDispatch(updateSuccess(result.user));

	    if (result.playlistsPromise) {
		try {
		    const { playlists, featured } = await result.playlistsPromise;
		    if (Array.isArray(featured)) {
			videoDispatch(getVideosSuccess(featured));
		    } else {
			videoDispatch(getVideosSuccess(featured?.results ?? []));
		    }

		    if (Array.isArray(playlists)) {
			playlistDispatch(getPlaylistsSuccess(playlists));
		    } else {
			playlistDispatch(getPlaylistsSuccess(playlists?.results ?? []));
		    }
		} catch (contentError) {
		    console.error('Failed to load initial content: ', contentError);
		    videoDispatch(getVideosFailure());
		    playlistDispatch(getPlaylistsFailure());
		}
	    } else {
		videoDispatch(getVideosSuccess([]));
		playlistDispatch(getPlaylistsSuccess([]));
	    }

	    navigate('/drone-videos', { replace: true });
	} catch (error) {
	    const normalizedError = error?.normalized || normalizeError(error);
	    console.error('Login failed: ', normalizedError);
	    authDispatch(loginFailure(normalizedError));
	    userDispatch(updateFailure(normalizedError));
	    videoDispatch(getVideosFailure());
	    playlistDispatch(getPlaylistsFailure());
	}
    };

    return (
	<AuthLayout
	    pageClassName='login'
	    videoTitle='Watch Futtech in action'
	    videoLink='https://player.mediadelivery.net/play/603147/ce5d072d-e53a-49fc-bcca-475aab60715e'
	    header={
		<div className='top'>
		    <img
			className='logo'
			src='/logo.png'
			alt='Logo of the Futtech Company'
		    />
		</div>
	    }
	>
	    <form onSubmit={handleSignIn}>
		<h1>Sign In</h1>
		<input type='email'
		       placeholder='Email address'
		       onChange={(e) => setEmail(e.target.value)}
		/>
		{fieldErrors.email && (
		    <div className='fieldError'>
			{fieldErrors.email}
		    </div>
		)}
		<input type='password'
		       placeholder='Password'
		       autoComplete='Password'
		       onChange={(e) => setPassword(e.target.value)}
		/>
		{fieldErrors.password && (
		    <div className='fieldError'>
			{fieldErrors.password}
		    </div>
		)}

		<button type='submit' disabled={isFetching}>
		    Sign In
		</button>

		{notice && (
		    <div className='userPrompt'>
			{notice}
		    </div>
		)}

		{loginError?.message && (
		    <div className='userPrompt'>
			{loginError.message}
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
	</AuthLayout>
    );
};

export default Login;
