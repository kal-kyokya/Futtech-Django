import './login.scss';
import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/authContext/AuthContext';
import axios from 'axios';
import { loginSuccess, loginFailure } from '../../contexts/authContext/AuthActions';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {dispatch, isFetching, error: resError } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
	e.preventDefault(); // Prevent form reload and allow data submission

	const res = await axios.post(
	    'http://127.0.0.1:8080/auth/signIn',
	    { email, password },
	    { headers: {'content-type': 'application/json'} }
	).then((res) => {
	    dispatch(loginSuccess(res.data));
	    navigate('/');
	}).catch((err) => {
	    console.log(err.response.data.error);
	    dispatch(loginFailure(err.response.data));
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

		    <span className='resetPassword'>
			<Link to='/reset-password' className='link'>
			    <u>Forgot Password?</u>
			</Link>
		    </span>
		    <span className='text'>
			New to Futtech? Sign up 
			<Link to='/register' className='link'>
				<b> here</b>.
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
