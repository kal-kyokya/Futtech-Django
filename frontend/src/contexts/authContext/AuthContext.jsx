/**
 * Auth context keeps session-scoped UI auth state in sync with token storage.
 *
 * Source of truth split:
 * - access token => tokenService
 * - user profile snapshot => localStorage/context state
 */
import { createContext, useReducer, useEffect } from 'react';
import AuthReducer from './AuthReducer';
import tokenService from '../../services/tokenService';

const storedUser = JSON.parse(localStorage.getItem('user'));
const hasAccessToken = tokenService.hasTokens();

const INITIAL_STATE = {
    isFetching: false,
    error: null,
    user: hasAccessToken ? storedUser : null,
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
	    // Prevent stale persisted user data from appearing authenticated.
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
