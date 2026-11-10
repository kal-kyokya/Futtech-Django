import './app.scss';
import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';
import { AuthContext } from './contexts/authContext/AuthContext';
import { UserContext } from './contexts/userContext/UserContext';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet,
} from 'react-router-dom';
import AuthService from './services/authService';
import PrivateRoute from './components/privateRoute/PrivateRoute';
import RouteError from './components/routeError/RouteError';

const About = lazy(() => import('./pages/about/About'));
const Register = lazy(() => import('./pages/register/Register'));
const Login = lazy(() => import('./pages/login/Login'));
const Home = lazy(() => import('./pages/home/Home'));
const User = lazy(() => import('./pages/user/User'));
const Watch = lazy(() => import('./pages/watch/Watch'));
const NewPlaylist = lazy(() => import('./pages/newPlaylist/NewPlaylist'));
const Playlists = lazy(() => import('./pages/playlists/Playlists'));
const Pricing = lazy(() => import('./pages/pricing/Pricing'));
const Showcase = lazy(() => import('./pages/showcase/Showcase'));
const ShowcaseVideo = lazy(() => import('./pages/showcaseVideo/ShowcaseVideo'));
const FuttechXI = lazy(() => import('./pages/futtechXI/FuttechXI'));

const RootLayout = () => (
    <div className='app-shell'>
	<a className='skip-link' href='#main-content'>
	    Skip to content
	</a>
	<div id='page-content' tabIndex={-1}>
	    <Outlet />
	</div>
    </div>
);

const App = () => {
    const [authReady, setAuthReady] = useState(false);
    const { dispatch: authDispatch } = useContext(AuthContext);
    const { dispatch: userDispatch } = useContext(UserContext);

    useEffect(() => {
        let cancelled = false;
        AuthService.restoreSession().then((user) => {
	    if (cancelled) return;
	    if (user) {
		authDispatch({ type: 'LOGIN_SUCCESS', payload: user });
		userDispatch({ type: 'REGISTRATION_SUCCESS', payload: user });
	    }
            setAuthReady(true);
        });
	return () => {
            cancelled = true;
	};
    }, [authDispatch, userDispatch]);

    const renderPublic = (component) => {
	if (!authReady) {
	    return <div className='auth-loading'>Loading...</div>;
	}

        return AuthService.isAuthenticated() ? <Home /> : component;
    };

    const renderLanding = () => {
	if (!authReady) {
	    return <div className='auth-loading'>Loading...</div>;
	}

        return AuthService.isAuthenticated() ? (
            <PrivateRoute isReady={authReady}>
		<Home category='videos' />
            </PrivateRoute>
        ) : (
            <Register />
        );
    };

    const routes = (
        <Routes>
            <Route path='/' element={<RootLayout />}>
		<Route index element={renderLanding()} />
		<Route path='register' element={renderPublic(<Register />)} />
		<Route path='login' element={renderPublic(<Login />)} />
		<Route path='showcase' element={<Showcase />} />
		<Route path='showcase/:slug' element={<ShowcaseVideo />} />
		<Route path='about' element={<About />} />
		<Route path='futtech-xi' element={<FuttechXI />} />
		<Route
		    path='home'
		    element={
			<PrivateRoute isReady={authReady}>
			    <Home />
			</PrivateRoute>
		    }
		/>
		<Route
		    path='videos'
		    element={
			<PrivateRoute isReady={authReady}>
			    <Home />
			</PrivateRoute>
		    }
		/>
		<Route
		    path='drone-videos'
		    element={
			<PrivateRoute isReady={authReady}>
			    <Home category='drone' />
			</PrivateRoute>
		    }
		/>
		<Route
		    path='ai-analysis'
		    element={
			<PrivateRoute isReady={authReady}>
			    <Home category='analysis' />
			</PrivateRoute>
		    }
		/>
		<Route
		    path='watch/:slug'
		    element={
			<PrivateRoute isReady={authReady}>
			    <Watch />
			</PrivateRoute>
		    }
		/>
		<Route
		    path='pricing-page'
		    element={
			<PrivateRoute isReady={authReady}>
			    <Pricing />
			</PrivateRoute>
		    }
		/>
		<Route
		    path='profile'
		    element={
			<PrivateRoute isReady={authReady}>
			    <User />
			</PrivateRoute>
		    }
		/>
		<Route
		    path='user'
		    element={
			<PrivateRoute isReady={authReady}>
			    <User />
			</PrivateRoute>
		    }
		/>
		<Route
		    path='new-playlist'
		    element={
			<PrivateRoute isReady={authReady}>
			    <NewPlaylist />
			</PrivateRoute>
		    }
		/>
		<Route
		    path='playlists'
		    element={
			<PrivateRoute isReady={authReady}>
			    <Playlists />
			</PrivateRoute>
		    }
		/>
		<Route path='*' element={<Navigate to='/' replace />} />
            </Route>
        </Routes>
    );

    return (
        <ThemeProvider theme={theme}>
            <RouteError>
		<BrowserRouter>
		    <Suspense
			fallback={
			    <div className='auth-loading' role='status'>
				Loading page…
			    </div>
			}
		    >
			{routes}
		    </Suspense>
		</BrowserRouter>
            </RouteError>
        </ThemeProvider>
    );
};

export default App;
