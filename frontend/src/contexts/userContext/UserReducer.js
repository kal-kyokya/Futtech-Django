/**
 * UserReducer - An arrow-function updating the entire React App
 * 		 of the stage reached during the user registration flow.
 *
 * @params {Object} state - The initial React state used as user credentials.
 * @params {Object} action - A javascript object containing the name of
 * 			     stage reached and, optinally, the user/error.
 *
 * @returns {Object} The data set to be used as login credentials.
 **/
const UserReducer = (state, action) => {
    switch (action.type) {
      case 'REGISTRATION_START':
	return {
	    user: null,
	    isFetching: true,
	    error: null,
	    loggedOut: false,
	};

      case 'REGISTRATION_SUCCESS':
	return {
	    user: action.payload,
	    isFetching: false,
	    error: null,
	    loggedOut: false,
	};

      case 'REGISTRATION_FAILURE':
	return {
	    user: null,
	    isFetching: false,
	    error: action.payload,
	    loggedOut: false,
	};

      case  'CLEAR_USER_ERROR':
	return {
	    ...state,
	    error: null,
	}

      case 'UPDATE_START':
	return {
	    ...state,
	    isFetching: true,
	    error: false,
	    loggedOut: false,
	};

      case 'UPDATE_SUCCESS':
	return {
	    user: action.payload,
	    isFetching: false,
	    error: false,
	    loggedOut: false,
	};

      case 'UPDATE_FAILURE':
	return {
	    ...state,
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

export default UserReducer;
