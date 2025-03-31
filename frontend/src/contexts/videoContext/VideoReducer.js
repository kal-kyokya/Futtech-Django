/**
 * A reducer function linking stages of video retrieval
 * to all the states (data) internally managed by React.
 *
 * Something of a router for potential stages reached.
 */

const VideoReducer = (state, action) => {
    switch (action.type) {
      case 'CREATE_VIDEO_START':
	return {
	    ...state,
	    isFetching: true,
	    error: false,
	};

      case 'CREATE_VIDEO_SUCCESS':
	return {
	    videos: [ ...state.videos, action.payload ],
	    isFetching: false,
	    error: false,
	};

      case 'CREATE_VIDEO_FAILURE':
	return {
	    ...state,
	    isFetching: false,
	    error: true,
	};

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

      case 'UPDATE_VIDEO_START':
	return {
	    ...state,
	    isFetching: true,
	    error: false,
	};

      case 'UPDATE_VIDEO_SUCCESS':
	return {
	    videos: state.videos.map(
		(video) => video._id === action.payload._id && action.payload
	    ),
	    isFetching: false,
	    error: false,
	};

      case 'UPDATE_VIDEO_FAILURE':
	return {
	    ...state,
	    isFetching: false,
	    error: true,
	};

      case 'DELETE_VIDEO_START':
	return {
	    ...state,
	    isFetching: true,
	    error: false,
	};

      case 'DELETE_VIDEO_SUCCESS':
	return {
	    videos: state.videos.filter((video) => video._id !== action.payload),
	    isFetching: false,
	    error: false,
	};

      case 'DELETE_VIDEO_FAILURE':
	return {
	    ...state,
	    isFetching: false,
	    error: true,
	};

      default:
	return { ...state };
    }
};

export default VideoReducer;
