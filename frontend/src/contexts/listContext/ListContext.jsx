import { createContext, useReducer, useEffect } from 'react';
import ListReducer from './ListReducer';

const INITIAL_STATE = {
    lists: JSON.parse(localStorage.getItem('lists')) || [],
    isFetching: false,
    error: false,
};

export const ListContext = createContext(INITIAL_STATE);

export const ListContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ListReducer, INITIAL_STATE);

    useEffect(() => {
	localStorage.setItem('lists', JSON.stringify(state.lists));
    }, [state.lists]);

    return (
	<ListContext.Provider
	    value={{
		lists: state.lists,
		isFetching: state.isFetching,
		error: state.error,
		dispatch
	    }}
	>
	    { children }
	</ListContext.Provider>
    );
};
