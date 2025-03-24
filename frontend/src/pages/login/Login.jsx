import './login.scss';
import { useState, useContext } from 'react';
import login from '../../contexts/authContext/apiCalls.js';
import { AuthContext } from '../../contexts/authContext/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {dispatch, isFetching} = useContext(AuthContext);

    const handleSignIn = (e) => {
	e.preventDefault();

	login(
	    { email, password },
	    dispatch,
	);
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
		    <span className='resetPassword'>
			Forgot Password?
		    </span>
		    <span className='text'>
			New to Futtech? <b>Sign up now</b>.
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
