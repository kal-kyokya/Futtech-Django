import { createContext, useReducer, useEffect } from 'react';
import VideoReducer from './VideoReducer';

const INITIAL_STATE = {
    videos: JSON.parse(localStorage.getItem('videos')) || [],
    isFetching: false,
    error: false,
};

export const VideoContext = createContext(INITIAL_STATE);

export const VideoContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(VideoReducer, INITIAL_STATE);

    useEffect(() => {
	localStorage.setItem('videos', JSON.stringify(state.videos));
    }, [state.videos]);

    return (
	<VideoContext.Provider
	    value={{
		videos: state.videos,
		isFetching: state.isFetching,
		error: state.error,
		dispatch
	    }}
	>
	    { children }
	</VideoContext.Provider>
    );
};
