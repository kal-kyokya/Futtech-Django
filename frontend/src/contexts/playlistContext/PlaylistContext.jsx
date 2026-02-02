import { createContext, useReducer, useEffect } from 'react';
import PlaylistReducer from './PlaylistReducer';

const INITIAL_STATE = {
    playlists: JSON.parse(localStorage.getItem('playlists')) || [],
    isFetching: false,
    error: false,
};

export const PlaylistContext = createContext(INITIAL_STATE);

export const PlaylistContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(PlaylistReducer, INITIAL_STATE);

    useEffect(() => {
	localStorage.setItem('playlists', JSON.stringify(state.playlists));
    }, [state.playlists]);

    return (
	<PlaylistContext.Provider
	    value={{
		playlists: state.playlists,
		isFetching: state.isFetching,
		error: state.error,
		dispatch
	    }}
	>
	    { children }
	</PlaylistContext.Provider>
    );
};
