/**
 * A collection of callbacks returning objects
 * tracking the stages of Authentication.
 */

export const loginStart = () => ({
    type: 'LOGIN_START',
});

export const loginSuccess = (user) => ({
    type: 'LOGIN_SUCCESS',
    payload: user,
});

export const loginFailure = () => ({
    type: 'LOGIN_FAILURE',
});
