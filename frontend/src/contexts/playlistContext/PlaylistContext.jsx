/**
 * Playlist context stores list-fetch state and a cached playlist collection.
 *
 * Private playlist state belongs to the current in-memory session.
 *
 * Data is persisted to localStorage to reduce empty-state flashes between
 * page reloads while fresh network data is loading.
 */
import { createContext, useReducer, useEffect } from 'react';
import PlaylistReducer from './PlaylistReducer';
import tokenService from '../../services/tokenService';

const INITIAL_STATE = { playlists: [], isFetching: false, error: false };

export const PlaylistContext = createContext(INITIAL_STATE);

export const PlaylistContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(PlaylistReducer, INITIAL_STATE);

    useEffect(() => {
	try {
	    localStorage.removeItem('playlists');
	} catch {
	    // Authentication does not require browser storage.
	}
	return tokenService.subscribe((token) => {
	    if (!token) dispatch({ type: 'RESET_PLAYLISTS' });
	});
    }, []);

    return (
	<PlaylistContext.Provider value={{ ...state, dispatch }}>
	    {children}
	</PlaylistContext.Provider>
    );
};
