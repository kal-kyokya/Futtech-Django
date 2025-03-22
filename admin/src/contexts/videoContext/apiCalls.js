import axios from 'axios';
import { getVideosStart } from './AuthActions';

const getVideos = async (dispatch) => {
    dispatch(getVideosStart());

    try {
	const res = await axios.get('/videos/all', {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.getItem('user')).accessToken,
	    }
	});

	dispatch(getVideosSuccess(res.data));
    } catch (err) {
	console.log(err);
    }

    dispatch(getVideosFailure());
};

export const deleteVideos = async (id, dispatch) => {
    dispatch(deleteVideosStart());

    try {
	await axios.delete('/videos/' + id, {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.deleteItem('user')).accessToken,
	    }
	});

	dispatch(deleteVideosSuccess(id));
    } catch (err) {
	console.log(err);
    }

    dispatch(deleteVideosFailure());
};

export default getVideos;
