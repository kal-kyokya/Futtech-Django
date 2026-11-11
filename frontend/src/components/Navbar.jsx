import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/userContext/UserContext';
import { AuthContext } from '../contexts/authContext/AuthContext';
import { logOut as userLogOut } from '../contexts/userContext/UserActions';
import { logOut as authLogOut } from '../contexts/authContext/AuthActions';
import authService from '../services/authService';
import tokenService from '../services/tokenService';
import SiteHeader from './layout/SiteHeader';

export default function Navbar() {
    const { dispatch: userDispatch } = useContext(UserContext);
    const { dispatch: authDispatch } = useContext(AuthContext);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
	if (loggingOut) return;

	setLoggingOut(true);

	await authService.logout();
	tokenService.clearAccessToken();

	try {
	    localStorage.setItem('videos', JSON.stringify([]));
	} catch {
	    /* Storage may be blocked. */
	}

	userDispatch(userLogOut());
	authDispatch(authLogOut());

	navigate('/login', {
	    replace: true,
	    state: { notice: 'Logged out successfully.' },
	});
    };

    return <SiteHeader member onLogout={handleLogout} loggingOut={loggingOut} />;
}
