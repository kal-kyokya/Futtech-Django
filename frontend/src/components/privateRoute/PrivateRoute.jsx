import './privateRoute.scss';
import { Navigate } from 'react-router-dom';
import AuthService from '../../services/authService';

const PrivateRoute = ({ children, isReady, redirectTo = '/register' }) => {
    if (!isReady) {
	return <div className='auth-loading'>
		   Loading...
	       </div>;
    }

    if (!AuthService.isAuthenticated()) {
	return <Navigate to={redirectTo}
			 replace
	       />
    }

    return children;
};

export default PrivateRoute;
