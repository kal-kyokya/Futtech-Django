/** Persist UI profile data without legacy credentials or startup parse failures. */
const withoutCredentials = (user) => {
    if (!user || typeof user !== 'object' || Array.isArray(user)) return null;
    return Object.fromEntries(
	Object.entries(user).filter(
	    ([key]) =>
            ![
		'access',
		'refresh',
		'accessToken',
		'access_token',
		'refresh_token',
            ].includes(key),
	),
    );
};

export const readStoredUser = () => {
    try {
	return withoutCredentials(JSON.parse(localStorage.getItem('user')));
    } catch {
	return null;
    }
};

export const writeStoredUser = (user) => {
    try {
	localStorage.setItem('user', JSON.stringify(withoutCredentials(user)));
    } catch {
	// A blocked storage API must not prevent login or logout.
    }
};
