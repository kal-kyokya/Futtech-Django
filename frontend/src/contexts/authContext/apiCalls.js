import axios from 'axios';
import { loginStart, loginSuccess, loginFailure } from './AuthActions';

const login = async (user, dispatch) => {
    dispatch(loginStart());

    try {
	const res = await axios.post('/auth/signIn', user);

	dispatch(loginSuccess(res.data));
    } catch (err) {
	console.log(err);
    }

    dispatch(loginFailure());
};

export default login;
