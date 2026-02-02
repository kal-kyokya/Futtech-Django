/**
 * A collection of callbacks returning objects
 * tracking the stages of playlist CRUD operations.
 */

// CREATE

export const createPlaylistStart = () => ({
    type: 'CREATE_PLAYLIST_START',
});

export const createPlaylistSuccess = (playlist) => ({
    type: 'CREATE_PLAYLIST_SUCCESS',
    payload: playlist,
});

export const createPlaylistFailure = () => ({
    type: 'CREATE_PLAYLIST_FAILURE',
});

// GET

export const getPlaylistsStart = () => ({
    type: 'GET_PLAYLISTS_START',
});

export const getPlaylistsSuccess = (playlists) => ({
    type: 'GET_PLAYLISTS_SUCCESS',
    payload: playlists,
});

export const getPlaylistsFailure = () => ({
    type: 'GET_PLAYLISTS_FAILURE',
});

// UPDATE

export const updatePlaylistStart = () => ({
    type: 'UPDATE_PLAYLIST_START',
});

export const updatePlaylistSuccess = (playlist) => ({
    type: 'UPDATE_PLAYLIST_SUCCESS',
    payload: playlist,
});

export const updatePlaylistFailure = () => ({
    type: 'UPDATE_PLAYLIST_FAILURE',
});

// DELETE

export const deletePlaylistStart = () => ({
    type: 'DELETE_PLAYLIST_START',
});

export const deletePlaylistSuccess = (playlist) => ({
    type: 'DELETE_PLAYLIST_SUCCESS',
    payload: playlist,
});

export const deletePlaylistFailure = () => ({
    type: 'DELETE_PLAYLIST_FAILURE',
});
