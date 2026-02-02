/**
 * A reducer function linking stages of playlist retrieval
 * to all the states (data) internally managed by React.
 *
 * Something of a router for potential stages reached.
 */

const PlaylistReducer = (state, action) => {
    switch (action.type) {
      case 'CREATE_PLAYLIST_START':
	return {
	    ...state,
	    isFetching: true,
	    error: false,
	};

      case 'CREATE_PLAYLIST_SUCCESS':
	return {
	    playlists: [ ...state.playlists, action.payload ],
	    isFetching: false,
	    error: false,
	};

      case 'CREATE_PLAYLIST_FAILURE':
	return {
	    ...state,
	    isFetching: false,
	    error: true,
	};

      case 'GET_PLAYLISTS_START':
	return {
	    playlists: [],
	    isFetching: true,
	    error: false,
	};

      case 'GET_PLAYLISTS_SUCCESS':
	return {
	    playlists: action.payload,
	    isFetching: false,
	    error: false,
	};

      case 'GET_PLAYLISTS_FAILURE':
	return {
	    playlists: [],
	    isFetching: false,
	    error: true,
	};

      case 'UPDATE_PLAYLIST_START':
	return {
	    ...state,
	    isFetching: true,
	    error: false,
	};

      case 'UPDATE_PLAYLIST_SUCCESS':
	return {
	    playlists: state.playlists.map(
		(playlist) => playlist._id === action.payload._id ? action.payload : playlist
	    ),
	    isFetching: false,
	    error: false,
	};

      case 'UPDATE_PLAYLIST_FAILURE':
	return {
	    ...state,
	    isFetching: false,
	    error: true,
	};

      case 'DELETE_PLAYLIST_START':
	return {
	    ...state,
	    isFetching: true,
	    error: false,
	};

      case 'DELETE_PLAYLIST_SUCCESS':
	return {
	    playlists: state.playlists.filter((playlist) => playlist._id !== action.payload._id),
	    isFetching: false,
	    error: false,
	};

      case 'DELETE_PLAYLIST_FAILURE':
	return {
	    ...state,
	    isFetching: false,
	    error: true,
	};

      default:
	return { ...state };
    }
};

export default PlaylistReducer;
