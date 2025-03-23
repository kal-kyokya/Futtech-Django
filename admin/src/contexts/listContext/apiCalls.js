import axios from 'axios';
import {
    createListStart, createListSuccess, createListFailure,
    getListsStart, getListsSuccess, getListsFailure,
    updateListStart, updateListSuccess, updateListFailure,
    deleteListStart, deleteListSuccess, deleteListFailure,
} from './ListActions';

// CREATE

export const createList = async (list, dispatch) => {
    dispatch(createListStart());

    try {
	const res = await axios.post('/lists', list, {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.createItem('user')).accessToken,
	    }
	});

	dispatch(createListSuccess(res.data));
    } catch (err) {
	console.log(err);
    }

    dispatch(createListFailure());
};

// GET

export const getLists = async (dispatch) => {
    dispatch(getListsStart());

    try {
	const res = await axios.get('/lists/all', {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.getItem('user')).accessToken,
	    }
	});

	dispatch(getListsSuccess(res.data));
    } catch (err) {
	console.log(err);
    }

    dispatch(getListsFailure());
};

// DELETE

export const deleteList = async (id, dispatch) => {
    dispatch(deleteListStart());

    try {
	await axios.delete('/lists/' + id, {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.deleteItem('user')).accessToken,
	    }
	});

	dispatch(deleteListSuccess(id));
    } catch (err) {
	console.log(err);
    }

    dispatch(deleteListFailure());
};
