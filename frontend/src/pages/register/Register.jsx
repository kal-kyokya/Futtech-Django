import './register.scss';
import { useState, useRef, useContext } from 'react';
import { AuthContext } from '../../contexts/authContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginSuccess, loginFailure } from '../../contexts/authContext/AuthActions';
import { Link } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const { dispatch, isFetching, error: resError } = useContext(AuthContext);
    const navigate = useNavigate();

    const emailRef = useRef();

    const handleEmail = () => {
	setEmail(emailRef.current.value);
    }

    const handleRegister = async (e) => {
	e.preventDefault(); // Prevent form reload and allow data submission

	const res = await axios.post(
	    'http://127.0.0.1:8080/users/signUp',
	    { username, email, password },
	    { headers: {'content-type': 'application/json'} }
	).then((res) => {
	    dispatch(loginSuccess(res.data));
	    navigate('/login');
	}).catch((err) => {
	    console.log(err.response.data.error);
	    dispatch(loginFailure(err.response.data));
	});
    };

    return (
	<div className='register'>
	    <div className='top'>
		<div className='wrapper'>
		    <img
			className='logo'
			src='../../../public/logo.png'
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
		<h2>Check the Demo here.</h2>
		<h4>Want to register? Enter your email to create or restart your membership.</h4>

		{ email ? (
		    <form className='membership'>
			<input type='username'
			       placeholder='Username'
			       onChange={(e) => setUsername(e.target.value)}
			/>
			<input type='password'
			       placeholder='Password'
			       autoComplete='password'
			       onChange={(e) => setPassword(e.target.value)}
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
		    <div className='errorMessage'>
			{resError.error}
		    </div>
		)}
	    </div>

	</div>
    );
};

export default Register;
