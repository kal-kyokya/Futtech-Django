/**
 * A collection of callbacks returning objects
 * tracking the stages of video DB retrieval.
 */

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
