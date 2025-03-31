/**
 * A reducer function linking stages of user retrieval
 * to all the states (data) internally managed by React.
 *
 * Something of a router for potential stages reached.
 */

const UserReducer = (state, action) => {
    switch (action.type) {
      case 'SIGNIN_START':
	return {
	    user: null,
	    isFetching: true,
	    error: null,
	    loggedOut: false,
	};

      case 'SIGNIN_SUCCESS':
	return {
	    user: action.payload,
	    isFetching: false,
	    error: null,
	    loggedOut: false,
	};

      case 'SIGNIN_FAILURE':
	return {
	    user: null,
	    isFetching: false,
	    error: action.payload,
	    loggedOut: false,
	};

      case 'UPDATE_USER_START':
	return {
	    ...state,
	    isFetching: true,
	    error: false,
	    loggedOut: false,
	};

      case 'UPDATE_USER_SUCCESS':
	return {
	    user: action.payload,
	    isFetching: false,
	    error: false,
	    loggedOut: false,
	};

      case 'UPDATE_USER_FAILURE':
	return {
	    ...state,
	    isFetching: false,
	    error: true,
	    loggedOut: false,
	};

      case 'LOGOUT':
	return {
	    user: null,
	    isFetching: false,
	    error: null,
	    loggedOut: true,
	};

      default:
	return { ...state };
    }
};

export default UserReducer;
