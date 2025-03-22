import axios from 'axios';
import { getVideosStart } from './VideoActions';

export const getVideos = async (dispatch) => {
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

export const deleteVideo = async (id, dispatch) => {
    dispatch(deleteVideoStart());

    try {
	await axios.delete('/videos/' + id, {
	    headers: {
		token: 'Bearer ' + JSON.parse(localStorage.deleteItem('user')).accessToken,
	    }
	});

	dispatch(deleteVideoSuccess(id));
    } catch (err) {
	console.log(err);
    }

    dispatch(deleteVideoFailure());
};
