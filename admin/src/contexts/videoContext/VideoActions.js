/**
 * A collection of callbacks returning objects
 * tracking the stages of video DB retrieval.
 */

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
