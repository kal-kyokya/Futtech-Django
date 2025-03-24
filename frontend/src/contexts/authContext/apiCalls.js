import axios from 'axios';
import { loginStart, loginSuccess, loginFailure } from './AuthActions';
import { useNavigate } from 'react-router-dom';

const login = async (user, dispatch) => {
    dispatch(loginStart());

    try {
	const res = await axios.post(
	    'http:/127.0.0.1:8080/auth/signIn',
	    user,
	    { headers: {'content-type': 'application/json'} }
	);

	dispatch(loginSuccess(res.data));
    } catch (err) {
	console.log(err);
    }

    dispatch(loginFailure());
};

export default login;
