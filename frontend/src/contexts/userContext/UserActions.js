/**
 * A collection of callbacks returning objects
 * tracking the stages of user CRUD operations.
 */

// SIGNIN

export const signinStart = () => ({
    type: 'SIGNIN_START',
});

export const signinSuccess = (user) => ({
    type: 'SIGNIN_SUCCESS',
    payload: user,
});

export const signinFailure = (error) => ({
    type: 'SIGNIN_FAILURE',
    payload: error,
});

// UPDATE

export const updateUserStart = () => ({
    type: 'UPDATE_USER_START',
});

export const updateUserSuccess = (user) => ({
    type: 'UPDATE_USER_SUCCESS',
    payload: user,
});

export const updateUserFailure = () => ({
    type: 'UPDATE_USER_FAILURE',
});

// LOGOUT

export const logOut = () => ({
    type: 'LOGOUT',
});
