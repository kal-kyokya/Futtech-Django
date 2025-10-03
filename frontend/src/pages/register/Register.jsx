import './register.scss';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useState, useRef, useContext } from 'react';
import { UserContext } from '../../contexts/userContext/UserContext';
import {
    registrationStart,
    registrationSuccess,
    registrationFailure } from '../../contexts/userContext/UserActions';


const Register = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");

    const { dispatch,
	    isFetching,
	    loggedOut,
	    error: registrationError } = useContext(UserContext);

    const emailRef = useRef();
    const handleEmail = () => {
	const emailRegEx = /^[a-zA-Z0-9_.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	if (emailRegEx.test(emailRef.current.value)) {
	    if (registrationError) { registrationError.error = 'Valid Email'; }

	    setEmail(emailRef.current.value);
	} else {
	    dispatch(registrationFailure({ error: 'Invalid Email' }));
	}
    }

    const handleRegister = async (e) => {
	e.preventDefault(); // Prevents form reload and allows data submission
	dispatch(registrationStart());

	if (email && username && password1 && password2) {
	    await apiClient.post('/auth/register',
				 { username, email,
				   password1, password2 },
	    ).then((response) => {
		const { message, access, user } = response.data;

		// Store the access token in memory
		tokenService.setAccessToken(access);

		// Fetch the initial display content
		const playlistPromise = this.fetchInitialContent();

		const navigate = useNavigate();
		navigate('/login');
	    }).catch((err) => {
		console.log(err.response.data.error);
		dispatch(registrationFailure(err.response.data));
	    });
	} else {
	    if (!username) {
		dispatch(registrationFailure({ error: 'Username required' }));
	    } else {
		dispatch(registrationFailure({ error: 'Password required' }));
	    }
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

		{ registrationError && (
		    <div className='userPrompt'>
			{registrationError.error}.
		    </div>
		)}

		{ email ? (
		    <form className='membership'>
			<input type='password'
			       placeholder='Password'
			       onChange={(e) => {setPassword1(e.target.value)}}
			       required
			/>
			<input type='password'
			       placeholder='Confirm password'
			       onChange={(e) => {setPassword2(e.target.value)}}
			       required
			/>

			<button className='finish'
				onClick={handleRegister}
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
			<input type='username'
			       placeholder='Username'
			       onChange={(e) {setUsername(e.target.value)}}
			       required
			/>

			<button className='getStarted'
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
