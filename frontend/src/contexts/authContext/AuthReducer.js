/**
 * A reducer function linking stages of Authentication
 * to the states (data) internally managed by React.
 *
 * Something of a router for a potential Auth stages.
 */

const AuthReducer = (state, action) => {
    switch (action.type) {
      case 'LOGIN_START':
	return {
	    user: null,
	    isFetching: true,
	    error: null,
	    loggedOut: false,
	};

      case 'LOGIN_SUCCESS':
	return {
	    user: action.payload,
	    isFetching: false,
	    error: null,
	    loggedOut: false,
	};

      case 'LOGIN_FAILURE':
	return {
	    user: null,
	    isFetching: false,
	    error: action.payload,
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

export default AuthReducer;
