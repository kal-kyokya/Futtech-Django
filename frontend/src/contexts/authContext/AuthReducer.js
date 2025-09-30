/**
 * AuthReducer - An arrow-function updating the entire React App
 * 		 of the stage reached during the user login flow.
 *
 * @params {Object} state - The initial React state used as login credentials.
 * @params {Object} action - A javascript object containing the name of
 * 			     stage reached and, optinally, the user/error.
 *
 * @returns {Object} The data set to be used as login credentials.
 **/
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
