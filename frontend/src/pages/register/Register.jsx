import './register.scss';
import { useState, useRef, useContext } from 'react';
import { AuthContext } from '../../contexts/authContext/AuthContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    loginStart, loginSuccess, loginFailure } from '../../contexts/authContext/AuthActions';
import { logOut } from '../../contexts/userContext/UserActions';
import { Link } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const { dispatch,
	    isFetching,
	    error: resError } = useContext(AuthContext);
    const navigate = useNavigate();
    const { loggedOut, dispatch: userDispatch } = useContext(UserContext);

    const emailRef = useRef();

    const handleEmail = () => {
	const emailRegEx = /^[a-zA-Z0-9_.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	if (emailRegEx.test(emailRef.current.value)) {
	    if(resError) { resError.error = 'Valid Email'; }
	    setEmail(emailRef.current.value);
	} else {
	    dispatch(loginFailure({ error: 'Invalid Email' }));
	}
    }

    const handleUsername = (e) => {
	setUsername(e.target.value);
    };

    const handlePassword = (e) => {
	setPassword(e.target.value);
    };

    const handleRegister = async (e) => {
	e.preventDefault(); // Prevent form reload and allow data submission
	dispatch(loginStart());

	if (username && password) {
	    await axios.post(
		'http://127.0.0.1:8080/users/signUp',
		{ username, email, password },
		{ headers: {'content-type': 'application/json'} }
	    ).then((res) => {
		console.log(res.data);
		dispatch(loginSuccess(res.data));
		navigate('/login');
	    }).catch((err) => {
		console.log(err.response.data.error);
		dispatch(loginFailure(err.response.data));
	    });
	} else {
	    if (!username) {
		dispatch(loginFailure({ error: 'Username required' }));
	    } else {
		dispatch(loginFailure({ error: 'Password required' }));
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
			<button className='signIn'>
			    <span>
				Sign In
			    </span>
			</button>
		    </Link>
		</div>
	    </div>

	    <div className='container'>
		<h1>Drone Footage, Tactical/Technical Analysis, and more</h1>
		<h2>
		    Learn more <Link className='link'
					 to='/about'
				   >
				       <u>here</u>.
				   </Link>
		</h2>
		<h4>Want to register? Enter your email to create or restart your membership.</h4>

		{ email ? (
		    <form className='membership'>
			<input type='username'
			       placeholder='Username'
			       onChange={handleUsername}
			       required
			/>
			<input type='password'
			       placeholder='Password'
			       autoComplete='password'
			       onChange={handlePassword}
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
			<button className='getStarted'
				onClick={handleEmail}>
			    <span>
				Get Started
			    </span>
			</button>
		    </div>
		)}

		{ resError && (
		    <div className='userPrompt'>
			{resError.error}.
		    </div>
		)}

		{ loggedOut && (
		    <div className='userPrompt'>
			You have successfully logged out.
		    </div>
		)}
	    </div>

	</div>
    );
};

export default Register;
