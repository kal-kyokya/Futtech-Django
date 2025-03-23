/**
 * A collection of callbacks returning objects
 * tracking the stages of video CRUD operations.
 */

// CREATE

export const createVideoStart = () => ({
    type: 'CREATE_VIDEO_START',
});

export const createVideoSuccess = (video) => ({
    type: 'CREATE_VIDEO_SUCCESS',
    payload: video,
});

export const createVideoFailure = () => ({
    type: 'CREATE_VIDEO_FAILURE',
});

// GET

export const getVideosStart = () => ({
    type: 'GET_VIDEOS_START',
});

export const getVideosSuccess = (videos) => ({
    type: 'GET_VIDEOS_SUCCESS',
    payload: videos,
});

export const getVideosFailure = () => ({
    type: 'GET_VIDEOS_FAILURE',
});

// UPDATE

export const updateVideoStart = () => ({
    type: 'UPDATE_VIDEO_START',
});

export const updateVideoSuccess = (video) => ({
    type: 'UPDATE_VIDEO_SUCCESS',
    payload: video,
});

export const updateVideoFailure = () => ({
    type: 'UPDATE_VIDEO_FAILURE',
});

// DELETE

export const deleteVideoStart = () => ({
    type: 'DELETE_VIDEO_START',
});

export const deleteVideoSuccess = (video) => ({
    type: 'DELETE_VIDEO_SUCCESS',
    payload: video,
});

export const deleteVideoFailure = () => ({
    type: 'DELETE_VIDEO_FAILURE',
});
