/**
 * A reducer function linking stages of user retrieval
 * to all the states (data) internally managed by React.
 *
 * Something of a router for potential stages reached.
 */

const UserReducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_USER_START':
	return {
	    ...state,
	    isFetching: true,
	    error: false,
	};

      case 'UPDATE_USER_SUCCESS':
	return {
	    user: action.payload,
	    isFetching: false,
	    error: false,
	};

      case 'UPDATE_USER_FAILURE':
	return {
	    ...state,
	    isFetching: false,
	    error: true,
	};

      default:
	return { ...state };
    }
};

export default UserReducer;
