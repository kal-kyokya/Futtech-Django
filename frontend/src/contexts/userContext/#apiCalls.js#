import axios from 'axios';
import {
    updateUserStart, updateUserSuccess, updateUserFailure,
} from './UserActions';

// UPDATE

export const updateUser = async (user, token, dispatch) => {
    dispatch(updateUserStart());

    try {
	const res = await axios.put('/users/' + user._id, user, {
	    headers: {
		token: 'Bearer ' + token,
	    }
	});

	dispatch(updateUserSuccess(res.data));
    } catch (err) {
	console.log(err);
    }

    dispatch(updateUserFailure());
};
