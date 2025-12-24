import { createContext, useReducer, useEffect } from 'react';
import UserReducer from './UserReducer';
import tokenService from '../../services/tokenService';

const storedUser = JSON.parse(localStorage.getItem('user'));
const hasAccessToken = tokenService.hasTokens();

const INITIAL_STATE = {
    isFetching: false,
    error: false,
    user: hasAccessToken ? storedUser : null,
    loggedOut: false
};

export const UserContext = createContext(INITIAL_STATE);

export const UserContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(UserReducer, INITIAL_STATE);

    useEffect(() => {
	localStorage.setItem('user', JSON.stringify(state.user));
    }, [state.user]);

    useEffect(() => {
	if (!tokenService.hasTokens() && state.user) {
	    dispatch({ type: 'LOGOUT' });
	}
    }, [state.user]);

    return (
	<UserContext.Provider
	    value={{
		user: state.user,
		isFetching: state.isFetching,
		error: state.error,
		loggedOut: state.loggedOut,
		dispatch
	    }}
	>
	    { children }
	</UserContext.Provider>
    );
};
