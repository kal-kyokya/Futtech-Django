/**
 * A collection of callbacks returning objects
 * tracking the stages of list CRUD operations.
 */

// CREATE

export const createListStart = () => ({
    type: 'CREATE_LIST_START',
});

export const createListSuccess = (list) => ({
    type: 'CREATE_LIST_SUCCESS',
    payload: list,
});

export const createListFailure = () => ({
    type: 'CREATE_LIST_FAILURE',
});

// GET

export const getListsStart = () => ({
    type: 'GET_LISTS_START',
});

export const getListsSuccess = (lists) => ({
    type: 'GET_LISTS_SUCCESS',
    payload: lists,
});

export const getListsFailure = () => ({
    type: 'GET_LISTS_FAILURE',
});

// UPDATE

export const updateListStart = () => ({
    type: 'UPDATE_LIST_START',
});

export const updateListSuccess = (list) => ({
    type: 'UPDATE_LIST_SUCCESS',
    payload: list,
});

export const updateListFailure = () => ({
    type: 'UPDATE_LIST_FAILURE',
});

// DELETE

export const deleteListStart = () => ({
    type: 'DELETE_LIST_START',
});

export const deleteListSuccess = (list) => ({
    type: 'DELETE_LIST_SUCCESS',
    payload: list,
});

export const deleteListFailure = () => ({
    type: 'DELETE_LIST_FAILURE',
});
