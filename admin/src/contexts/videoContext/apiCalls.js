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

export default getVideos;
