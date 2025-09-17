import axios from 'axios';
import { loginStart, loginSuccess, loginFailure } from './AuthActions';
import { useNavigate } from 'react-router-dom';


// Re-using the same conceptual API service as in '../newVideo/NewVideo'
export const apiService = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    interceptors: {
	request: (config) => {
	    const user = JSON.parse(localStorage.getItem('user'));
	    if (user && user.access_token) {
		config.headers.Authorization = `Bearer ${user.access_token}`;
	    }
	    return config;
	},
    },
});

const login = async (userCredentials, dispatch) => {
    dispatch(loginStart());

    try {
	const res = await axios.post(
	    '${import.meta.env.VITE_API_BASE_URL}/auth/login/',
	    userCredentials
	);

	if (res.data && res.data.access_token) {
	    localStorage.setItem('user', JSON.stringigy(res.data));
	    dispatch(loginSuccess(res.data));
	} else {
	    dispatch(loginFailure());
	}

    } catch (err) {
	dispatch(loginFailure());
    }
};

export default login;
