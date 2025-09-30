/**
 * './UserActions.js' contains a collection of callbacks.
 *		      Each generates a javascript object informing React of
 * 		      the stage reached during user registration and updates.
 */

// REGISTRATION

export const registrationStart = () => ({
    type: 'REGISTRATION_START',
});

export const registrationSuccess = (user) => ({
    type: 'REGISTRATION_SUCCESS',
    payload: user,
});

export const registrationFailure = (error) => ({
    type: 'REGISTRATION_FAILURE',
    payload: error,
});

// UPDATE

export const updateStart = () => ({
    type: 'UPDATE_START',
});

export const updateSuccess = (user) => ({
    type: 'UPDATE_SUCCESS',
    payload: user,
});

export const updateFailure = (error) => ({
    type: 'UPDATE_FAILURE',
    payload: error,
});

// LOGOUT

export const logOut = () => ({
    type: 'LOGOUT',
});
