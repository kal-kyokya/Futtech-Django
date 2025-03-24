import './register.scss';
import { useState, useRef, useContext } from 'react';
import { AuthContext } from '../../contexts/authContext/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const emailRef = useRef();
    const passwordRef = useRef();
    const usernameRef = useRef();

    const handleEmail = () => {
	setEmail(emailRef.current.value);
    }

    const handleRegister = async (e) => {
	e.preventDefault();

	setUsername(usernameRef.current.value);
	setPassword(passwordRef.current.value);

	try {
	    const res = await axios.post('/users/signUp', { username, email, password });

	    dispatch(createUserSuccess(res.data));
	    navigate('/login');
	} catch (err) {
	    console.log(err);
	}
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
		    <button className='signIn'>Sign In</button>
		</div>
	    </div>

	    <div className='container'>
		<h1>Drone Footage, Tactical/Technical Analysis, and more</h1>
		<h2>Check the Demo here.</h2>
		<p>Want to register? Enter your email to create or restart your membership.</p>

		{ email ? (
		    <form className='membership'>
			<input type='username'
			       placeholder='Username'
			       ref={usernameRef}
			/>
			<input type='password'
			       placeholder='Password'
			       ref={passwordRef}
			/>
			<button className='finish'
				onClick={handleRegister}>Start</button>
		    </form>
		) : (
		    <div className='membership'>
			<input type='email'
			       placeholder='Email address'
			       ref={emailRef}
			/>
			<button className='getStarted'
				onClick={handleEmail}>Get Started</button>
		    </div>
		)}
	    </div>

	</div>
    );
};

export default Register;
