import { createContext, useReducer, useEffect } from 'react';
import VideoReducer from './VideoReducer';

const INITIAL_STATE = {
    videos: [],
    isFetching: false,
    error: false,
};

export const VideoContext = createContext(INITIAL_STATE);

export const VideoContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(VideoReducer, INITIAL_STATE);

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
