/**
 * './AuthActions.js' contains a collection of callbacks.
 *		      Each generates a javascript object informing React
 * 		      of the stage reached during user logins.
 */

// LOGIN

export const loginStart = () => ({
    type: 'LOGIN_START',
});

export const loginSuccess = (user) => ({
    type: 'LOGIN_SUCCESS',
    payload: user,
});

export const loginFailure = (error) => ({
    type: 'LOGIN_FAILURE',
    payload: error,
});

export const clearAuthError = () => ({
    type: 'CLEAR_AUTH_ERROR',
});

// LOGOUT

export const logOut = () => ({
    type: 'LOGOUT',
});
