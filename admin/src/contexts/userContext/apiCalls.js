import axios from 'axios';
import {
    createUserStart, createUserSuccess, createUserFailure,
    getUsersStart, getUsersSuccess, getUsersFailure,
    updateUserStart, updateUserSuccess, updateUserFailure,
    deleteUserStart, deleteUserSuccess, deleteUserFailure,
} from './UserActions';

// CREATE

export const createUser = async (user, dispatch) => {
    dispatch(createUserStart());

    try {
	const res = await axios.post('/users', user, {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.createItem('user')).accessToken,
	    }
	});

	dispatch(createUserSuccess(res.data));
    } catch (err) {
	console.log(err);
    }

    dispatch(createUserFailure());
};

// GET

export const getUsers = async (dispatch) => {
    dispatch(getUsersStart());

    try {
	const res = await axios.get('/users/all', {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.getItem('user')).accessToken,
	    }
	});

	dispatch(getUsersSuccess(res.data));
    } catch (err) {
	console.log(err);
    }

    dispatch(getUsersFailure());
};

// UPDATE

export const updateUser = async (user, dispatch) => {
    dispatch(updateUserStart());

    try {
	const res = await axios.put('/users/' + user._id, user, {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.updateItem('user')).accessToken,
	    }
	});

	dispatch(updateUserSuccess(res.data));
    } catch (err) {
	console.log(err);
    }

    dispatch(updateUserFailure());
};

// DELETE

export const deleteUser = async (id, dispatch) => {
    dispatch(deleteUserStart());

    try {
	await axios.delete('/users/' + id, {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.deleteItem('user')).accessToken,
	    }
	});

	dispatch(deleteUserSuccess(id));
    } catch (err) {
	console.log(err);
    }

    dispatch(deleteUserFailure());
};
