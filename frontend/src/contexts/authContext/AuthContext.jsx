/**
 * Auth context keeps, session-scoped, UI, auth states in sync with token storage.
 *
 * Source of truth split:
 * - access token => tokenService
 * - user profile snapshot => localStorage/context state
 */
import { createContext, useReducer, useEffect } from 'react';
import AuthReducer from './AuthReducer';
import tokenService from '../../services/tokenService';
import { readStoredUser, writeStoredUser } from '../../services/userStorage';

const INITIAL_STATE = {
    isFetching: false,
    error: null,
    user: null,
    loggedOut: false,
};

const initialState = () => ({
    ...INITIAL_STATE,
    user: tokenService.hasTokens() ? readStoredUser() : null,
});

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(
	AuthReducer,
	INITIAL_STATE,
	initialState,
    );

    useEffect(() => {
	writeStoredUser(state.user);
    }, [state.user]);

    useEffect(
	() =>
	tokenService.subscribe((token) => {
	    // Prevent stale persisted user data from appearing authenticated.
	    if (!token) dispatch({ type: 'LOGOUT' });
	}),
	[],
    );

    return (
	<AuthContext.Provider
	    value={{
		user: state.user,
		isFetching: state.isFetching,
		error: state.error,
		loggedOut: state.loggedOut,
		dispatch,
	    }}
	>
	    {children}
	</AuthContext.Provider>
    );
};
