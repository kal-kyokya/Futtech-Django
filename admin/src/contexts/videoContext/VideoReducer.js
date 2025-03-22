/**
 * A reducer function linking stages of video retrieval
 * to all the states (data) internally managed by React.
 *
 * Something of a router for potential stages reached.
 */

const VideoReducer = (state, action) => {
    switch (action.type) {
      case 'GET_VIDEOS_START':
	return {
	    videos: [],
	    isFetching: true,
	    error: false,
	};

      case 'GET_VIDEOS_SUCCESS':
	return {
	    videos: action.payload,
	    isFetching: false,
	    error: false,
	};

      case 'GET_VIDEOS_FAILURE':
	return {
	    videos: [],
	    isFetching: false,
	    error: true,
	};

      default:
	return { ...state };
    }
};

export default VideoReducer;
