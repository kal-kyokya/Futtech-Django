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
    clearAuthError,
} from '../../contexts/authContext/AuthActions';
import {
    updateStart,
    updateSuccess,
    updateFailure,
} from '../../contexts/userContext/UserActions';
import {
    getVideosStart,
    getVideosSuccess,
    getVideosFailure,
} from '../../contexts/videoContext/VideoActions';
import {
    getPlaylistsStart,
    getPlaylistsSuccess,
    getPlaylistsFailure,
} from '../../contexts/playlistContext/PlaylistActions';
import authService from '../../services/authService';
import { normalizeError } from '../../services/apiClient';
import AuthLayout from '../../components/auth/AuthLayout';
import PublicHeader from '../../components/publicHeader/PublicHeader';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {
	dispatch: authDispatch,
	isFetching,
	error: loginError,
    } = useContext(AuthContext);

    const { dispatch: videoDispatch } = useContext(VideoContext);
    const { dispatch: playlistDispatch } = useContext(PlaylistContext);
    const { dispatch: userDispatch } = useContext(UserContext);

    const navigate = useNavigate();
    const location = useLocation();
    const fieldErrors = loginError?.fields || {};
    const [notice, setNotice] = useState('');

    useEffect(() => () => authDispatch(clearAuthError()), [authDispatch]);

    useEffect(() => {
	if (location.state?.notice) {
	    setNotice(location.state.notice);
	    navigate(location.pathname, { replace: true, state: {} });
	}
    }, [location.state, location.pathname, navigate]);

    const completeLogin = async (loginRequest) => {
	authDispatch(loginStart());
	userDispatch(updateStart());
	videoDispatch(getVideosStart());
	playlistDispatch(getPlaylistsStart());

	try {
	    const result = await loginRequest();

	    if (!result.success) {
		const normalizedError =
		      result.error || normalizeError(new Error('Login failed'));
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

    const handleSignIn = async (event) => {
	event.preventDefault();
	await completeLogin(() => authService.login({ email, password }));
    };

    const handleGoogleSuccess = async ({ credential }) => {
	if (!credential) {
	    authDispatch(
		loginFailure({
		    message: 'Google did not return a sign-in credential.',
		}),
	    );
	    return;
	}
	await completeLogin(() => authService.loginWithGoogle(credential));
    };

    const handleGoogleError = (error) => {
	if (error?.silent) {
	    return;
	}
	authDispatch(
	    loginFailure({ message: 'Google Sign-In was cancelled or failed.' }),
	);
    };

    return (
	<AuthLayout
	    pageClassName='login'
	    videoTitle='Watch Futtech in action'
	    videoLink='https://iframe.mediadelivery.net/embed/603147/eb570499-3ce6-4736-9dc4-0c6ae5d4ba93?loop=true'
	    header={<PublicHeader navigationId='login-navigation' />}
	>
	    <form onSubmit={handleSignIn}>
		<p className='eyebrow'>WELCOME BACK</p>
		<h1>Sign In</h1>
		<p className='authIntro'>Your next insight starts here.</p>

		{import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID && (
		    <>
			<GoogleSignInButton
			    onSuccess={handleGoogleSuccess}
			    onError={handleGoogleError}
			    disabled={isFetching}
			/>
			<div className='authDivider'>or continue with email</div>
		    </>
		)}
		<label htmlFor='login-email'>Email address</label>
		<input
		    id='login-email'
		    autoComplete='email'
		    required
		    aria-invalid={Boolean(fieldErrors.email)}
		    aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
		    type='email'
		    placeholder='Email address'
		    onChange={(e) => setEmail(e.target.value)}
		/>
		{fieldErrors.email && (
		    <div className='fieldError' id='login-email-error'>
			{fieldErrors.email}
		    </div>
		)}
		<label htmlFor='login-password'>Password</label>
		<input
		    id='login-password'
		    required
		    aria-invalid={Boolean(fieldErrors.password)}
		    aria-describedby={
			fieldErrors.password ? 'login-password-error' : undefined
		    }
		    type='password'
		    placeholder='Password'
		    autoComplete='current-password'
		    onChange={(e) => setPassword(e.target.value)}
		/>
		{fieldErrors.password && (
		    <div className='fieldError' id='login-password-error'>
			{fieldErrors.password}
		    </div>
		)}

		<button type='submit' disabled={isFetching}>
		    {isFetching ? 'Signing in…' : 'Sign In'}
		</button>

		{notice && <div className='userPrompt'>{notice}</div>}

		{loginError?.message && (
		    <div className='userPrompt' role='alert'>
			{loginError.message}
		    </div>
		)}

		<span className='text'>
		    New to Futtech? Sign up
		    <Link to='/register' className='link'>
			<b>
			    {' '}
			    <u>here</u>
			</b>
			.
		    </Link>
		</span>
	    </form>
	</AuthLayout>
    );
};

export default Login;

