import { useNavigate, useLocation } from 'react-router-dom';
import { normalizeError } from '../../services/apiClient';
import authService from '../../services/authService';
import { useState, useRef, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/userContext/UserContext';
import {
    registrationStart,
    registrationSuccess,
    registrationFailure,
    clearUserError,
} from '../../contexts/userContext/UserActions';
import HeroSection from '../../components/landing/HeroSection';
import ServicesSection from '../../components/landing/ServicesSection';
import AboutValueSection from '../../components/landing/AboutValueSection';
import DifferentiationSection from '../../components/landing/DifferentiationSection';
import BottomCtaSection from '../../components/landing/BottomCtaSection';
import PublicHeader from '../../components/publicHeader/PublicHeader';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const {
	dispatch,
	isFetching,
	error: registrationError,
    } = useContext(UserContext);

    const navigate = useNavigate();

    const { hash } = useLocation();
    useEffect(() => {
	if (hash === '#registration-form')
	    document
            .getElementById('registration-form')
        ?.scrollIntoView?.({ block: 'start' });
    }, [hash]);

    const fieldErrors = registrationError?.fields || {};
    useEffect(() => () => dispatch(clearUserError()), [dispatch]);

    const emailRef = useRef(null);
    const handleStart = () => {
	const emailRegEx = /^[a-zA-Z0-9_.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	if (!emailRef.current) {
	    return;
	}

	if (emailRegEx.test(emailRef.current.value)) {
	    dispatch(clearUserError());

	    if (username) {
		setEmail(emailRef.current.value);
	    } else {
		dispatch(registrationFailure({ message: 'Invalid Username.' }));
	    }
	} else {
	    dispatch(registrationFailure({ message: 'Invalid Email.' }));
	}
    };

    const handleGoogleSuccess = async ({ credential }) => {
	if (!credential) {
	    dispatch(
		registrationFailure({
		    message: 'Google did not return a sign-in credential.',
		}),
	    );
	    return;
	}

	dispatch(registrationStart());
	const result = await authService.loginWithGoogle(credential);
	if (!result.success) {
	    dispatch(
		registrationFailure(
		    result.error || normalizeError(new Error('Google Sign-In failed.')),
		),
	    );
	    return;
	}

	dispatch(registrationSuccess(result.user));
	navigate('/login');
    };

    const handleGoogleError = (error) => {
	if (error?.silent) {
	    return;
	}
	dispatch(
	    registrationFailure({
		message: 'Google Sign-In was cancelled or failed.',
	    }),
	);
    };

    const handleRegister = async (e) => {
	e.preventDefault();
	dispatch(registrationStart());

	if (password !== passwordConfirm) {
	    dispatch(
		registrationFailure({
		    message: 'Passwords do not match.',
		    fields: { passwordConfirm: 'Passwords do not match.' },
		}),
	    );
	    return;
	}

	try {
	    const result = await authService.register({
		email,
		username,
		password,
		passwordConfirm,
	    });

	    if (!result.success) {
		const normalizedError =
		      result.error || normalizeError(new Error('Registration failed.'));

		if (
		    normalizedError?.fields?.email ||
			normalizedError?.fields?.username
		) {
		    setEmail('');
		    setUsername('');
		    setPassword('');
		    setPasswordConfirm('');
		}

		dispatch(registrationFailure(normalizedError));
		return;
	    }

	    dispatch(registrationSuccess(result.user));
	    navigate('/login');
	} catch (error) {
	    const normalizedError = error?.normalized || normalizeError(error);
	    if (normalizedError?.fields?.email || normalizedError?.fields?.username) {
		setEmail('');
		setUsername('');
		setPassword('');
		setPasswordConfirm('');
	    }
	    dispatch(registrationFailure(normalizedError));
	}
    };

    return (
	<div className='register'>
	    <PublicHeader navigationId='register-navigation' />
	    <main className='registerMain' id='main-content' tabIndex={-1}>
		<HeroSection />
		<AboutValueSection />
		<ServicesSection />
		<DifferentiationSection />

		<section
		    className='landingSection conversionSection'
		    id='registration-form'
		    aria-labelledby='registration-heading'
		>
		    <div className='landingSection__header'>
			<h2 id='registration-heading'>
			    Get started with your first analysis
			</h2>
			<p>Create your Futtech account and send your footage for review.</p>
		    </div>

		    {import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID && (
			<>
			    <GoogleSignInButton
				onSuccess={handleGoogleSuccess}
				onError={handleGoogleError}
				disabled={isFetching}
				text='signup_with'
			    />
			    <div className='authDivider'>or continue with email</div>
			</>
		    )}
		    {!registrationError?.fields && registrationError?.message && (
			<div className='userPrompt' role='alert'>
			    {registrationError.message}
			</div>
		    )}

		    {email ? (
			<form
			    key='password-step'
			    className='membership'
			    onSubmit={handleRegister}
			>
			    <label htmlFor='register-password'>Password</label>
			    <input
				type='password'
				id='register-password'
				autoComplete='new-password'
				aria-invalid={Boolean(fieldErrors.password)}
				aria-describedby={
				    fieldErrors.password ? 'register-password-error' : undefined
				}
				placeholder='Password'
				onChange={(e) => setPassword(e.target.value)}
				required
			    />
			    {fieldErrors.password && (
				<div
				    className='fieldError'
				    id='register-password-error'
				    role='alert'
				>
				    {fieldErrors.password}
				</div>
			    )}
			    <label htmlFor='register-confirm'>Confirm password</label>
			    <input
				type='password'
				id='register-confirm'
				autoComplete='new-password'
				aria-invalid={Boolean(fieldErrors.passwordConfirm)}
				aria-describedby={
				    fieldErrors.passwordConfirm
					? 'register-confirm-error'
					: undefined
				}
				placeholder='Confirm password'
				onChange={(e) => setPasswordConfirm(e.target.value)}
				required
			    />
			    {fieldErrors.passwordConfirm && (
				<div
				    className='fieldError'
				    id='register-confirm-error'
				    role='alert'
				>
				    {fieldErrors.passwordConfirm}
				</div>
			    )}

			    <button className='finish' type='submit' disabled={isFetching}>
				<span>{isFetching ? 'Creating account…' : 'Start'}</span>
			    </button>
			</form>
		    ) : (
			<form
			    key='identity-step'
			    className='membership'
			    onSubmit={(event) => {
				event.preventDefault();
				handleStart();
			    }}
			>
			    <label htmlFor='register-email'>Email address</label>
			    <input
				type='email'
				id='register-email'
				autoComplete='email'
				aria-invalid={Boolean(fieldErrors.email)}
				aria-describedby={
				    fieldErrors.email ? 'register-email-error' : undefined
				}
				placeholder='Email address'
				ref={emailRef}
				required
			    />
			    {fieldErrors.email && (
				<div
				    className='fieldError'
				    id='register-email-error'
				    role='alert'
				>
				    {fieldErrors.email}
				</div>
			    )}
			    <label htmlFor='register-username'>Username</label>
			    <input
				type='text'
				id='register-username'
				autoComplete='username'
				aria-invalid={Boolean(fieldErrors.username)}
				aria-describedby={
				    fieldErrors.username ? 'register-username-error' : undefined
				}
				placeholder='Username'
				onChange={(e) => setUsername(e.target.value)}
				required
			    />
			    {fieldErrors.username && (
				<div
				    className='fieldError'
				    id='register-username-error'
				    role='alert'
				>
				    {fieldErrors.username}
				</div>
			    )}

			    <button className='getStarted' type='submit'>
				<span>Get Started</span>
			    </button>
			</form>
		    )}
		</section>

		<BottomCtaSection />
	    </main>
	</div>
    );
};

export default Register;
