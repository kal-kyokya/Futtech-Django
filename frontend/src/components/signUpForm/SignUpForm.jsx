import './signUpForm.scss';
import React from 'react';
import { useForm } from 'react-hook-form';


const SignUpForm = () => {
    const { register, handleSubmit,
	    formState: { errors, isSubmitting },
	    setError
	  } = useForm();

    const onSubmit = async (data) {
	return null;
    };

    return (
	<form onSubmit={handleSubmit(onSubmit)}>
	    <div>
		<label htmlFor='username'>Username</label>
		<input id='username'
		       {...register('username',
				    {
					required: 'Username is required'
				    })}
		/>
		{ errors.username &&
		  <p>{ errors.username.message }</p> }
	    </div>

	    <div>
		<label htmlFor='email'>Email</label>
		<input id='email'
		       type='email'
		       {...register('email',
				    {
					required: 'Email is required'
				    })}
		/>
		{ errors.email &&
		  <p>{ errors.email.message }</p> }
	    </div>

	    <div>
		<label htmlFor='password'>Password</label>
		<input id='password'
		       type='password'
		       {...register('password',
				    {
					required: 'Password is required'
				    })}
		/>
		{ errors.password &&
		  <p>{ errors.password.message }</p> }
	    </div>

	    <div>
		<label htmlFor='password2'>Confirm Password</label>
		<input id='password2'
		       type='password'
		       {...register('password2',
				    {
					required: 'Please confirm your password'
				    })}
		/>
		{ errors.password2 &&
		  <p>{ errors.password2.message }</p> }
	    </div>

	    <button type='submit'
		    disabled={isSubmitting}
	    >
		{ isSubmitting? 'Registering...' : 'Register' }
	    </button>
	</form>
    );
};

export default SignUpForm;
