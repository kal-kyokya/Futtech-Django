import './register.scss';
import { useState, useRef } from 'react';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const emailRef = useRef();
    const passwordRef = useRef();

    const handleEmail = () => {
	setEmail(emailRef.current.value);
    }
    const handlePassword = () => {
	setPassword(passwordRef.current.value);
    }

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
			<input type='password'
			       placeholder='Password'
			       ref={passwordRef}
			/>
			<button className='finish'
				onClick={handlePassword}>Start</button>
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
