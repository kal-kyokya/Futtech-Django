import { createContext, useReducer, useEffect } from 'react';
import UserReducer from './UserReducer';
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

export const UserContext = createContext(INITIAL_STATE);

export const UserContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(
	UserReducer,
	INITIAL_STATE,
	initialState,
    );

    useEffect(() => {
	writeStoredUser(state.user);
    }, [state.user]);

    useEffect(
	() =>
	tokenService.subscribe((token) => {
            if (!token) dispatch({ type: 'LOGOUT' });
	}),
	[],
    );

    return (
	<UserContext.Provider
	    value={{
		user: state.user,
		isFetching: state.isFetching,
		error: state.error,
		loggedOut: state.loggedOut,
		dispatch,
	    }}
	>
	    {children}
	</UserContext.Provider>
    );
};
