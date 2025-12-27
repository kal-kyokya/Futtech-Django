import './register.scss';
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { normalizeError } from '../../services/apiClient';
import { useState, useRef, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/userContext/UserContext';
import {
    registrationStart,
    registrationSuccess,
    registrationFailure,
    clearUserError } from '../../contexts/userContext/UserActions';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const { dispatch, isFetching,
	    loggedOut, error: registrationError } = useContext(UserContext);

    const navigate = useNavigate();
    const emailRef = useRef(null);
    const fieldErrors = registrationError?.fields || {};

    useEffect(() => (
	() => dispatch(clearUserError())
    ), [dispatch]);

    const handleEmail = () => {
	const emailRegEx = /^[a-zA-Z0-9_.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	if (!emailRef.current) {
	    return;
	}

	if (emailRegEx.test(emailRef.current.value)) {
	    setEmail(emailRef.current.value);
	    dispatch(clearUserError());
	} else {
	    dispatch(registrationFailure({ message: 'Invalid Email' }));
	}
    };

    const handleRegister = async (e) => {
	e.preventDefault(); // Prevents form reload and allows data submission
	dispatch(registrationStart());

	if (!email || !username || !password || !passwordConfirm) {
	    const message = !email
		  ? 'Email required.'
		  : !username
		  ? 'Username required.'
		  : 'Password required.';
	    dispatch(registrationFailure({ message }));
	    return;
	}

	if (password !== passwordConfirm) {
	    dispatch(registrationFailure({
		message: 'Passwords do not match.',
		fields: { passwordConfirm: 'Passwords do not match.' },
	    }));
	    return;
	}

	try {
	    const response = await apiClient.post(
		'/auth/register/',
		{ username, email, password, passwordConfirm },
	    );

	    dispatch(registrationSuccess(response.data));
	    navigate('/login');
	} catch (error) {
	    const normalizedError = error?.normalized || normalizeError(error);
	    dispatch(registrationFailure(normalizedError));
	}
    };

    return (
	<div className='register'>
	    <div className='top'>
		<div className='wrapper'>
		    <img
			className='logo'
			src='/logo.png'
			alt='Logo of the Futtech Company'
		    />

		    <Link to='/login' className='link'>
			<button className='logIn'>
			    <span>
				Log In
			    </span>
			</button>
		    </Link>
		</div>
	    </div>

	    <div className='container'>
		<h1>Drone Footage, Tactical/Technical Analysis, and more</h1>
		<h2>
		    Learn more <Link to='/about'>here.</Link>
		</h2>
		<h4>Ready to watch? Enter your details to create or restart your membership.</h4>

		{ registrationError?.message && (
		    <div className='userPrompt'>
			{registrationError.message}.
		    </div>
		)}

		{ email ? (
		    <form className='membership' onSubmit={handleRegister}>
			<input type='password'
			       placeholder='Password'
			       onChange={(e) => setPassword(e.target.value)}
			       required
			/>
			{fieldErrors.password && (
			    <div className='fieldError'>
				{fieldErrors.password}
			    </div>
			)}
			<input type='password'
			       placeholder='Confirm password'
			       onChange={(e) => setPasswordConfirm(e.target.value)}
			       required
			/>
			{fieldErrors.passwordConfirm && (
			    <div className='fieldError'>
				{fieldErrors.passwordConfirm}
			    </div>
			)}

			<button className='finish'
				type='submit'
				disabled={isFetching}
			>
			    <span>
				Start
			    </span>
			</button>
		    </form>

		) : (
		    <div className='membership'>
			<input type='email'
			       placeholder='Email address'
			       ref={emailRef}
			       required
			/>
			{fieldErrors.email && (
			    <div className='fieldError'>
				{fieldErrors.email}
			    </div>
			)}
			<input type='text'
			       placeholder='Username'
			       onChange={(e) => setUsername(e.target.value)}
			       required
			/>
			{fieldErrors.username && (
			    <div className='fieldError'>
				{fieldErrors.username}
			    </div>
			)}

			<button className='getStarted'
				type='button'
				onClick={handleEmail}>
			    <span>
				Get Started
			    </span>
			</button>
		    </div>
		)}

		{ loggedOut && (
		    <div className='userPrompt'>
			Log out successful ✔
		    </div>
		)}
	    </div>

	</div>
    );
};

export default Register;
