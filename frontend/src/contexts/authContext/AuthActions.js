/**
 * A collection of callbacks returning objects
 * tracking the stages of Authentication.
 */

// LOGIN

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

// LOGOUT

export const logOut = () => ({
    type: 'LOGOUT',
});
