import { createContext, useReducer, useEffect } from 'react';
import AuthReducer from './AuthReducer';
import tokenService from '../../services/tokenService';

const storedUser = JSON.parse(localStorage.getItem('user'));
const hasAccessToken = tokenService.hasTokens();

const INITIAL_STATE = {
    user: hasAccessToken ? storedUser : null,
    isFetching: false,
    error: null,
    loggedOut: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

    useEffect(() => {
	localStorage.setItem('user', JSON.stringify(state.user));
    }, [state.user]);

    useEffect(() => {
	if (!tokenService.hasTokens() && state.user) {
	    dispatch({ type: 'LOGOUT' });
	}
    }, [state.user]);

    return (
	<AuthContext.Provider
	    value={{
		user: state.user,
		isFetching: state.isFetching,
		error: state.error,
		loggedOut: state.loggedOut,
		dispatch
	    }}
	>
	    { children }
	</AuthContext.Provider>
    );
};
