import './app.scss';
import { useEffect, useState } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route,
    Navigate,
    Outlet } from 'react-router-dom';
import AuthService from './services/authService';
import PrivateRoute from './components/privateRoute/PrivateRoute';
import RouteError from './components/routeError/RouteError';

import About from './pages/about/About';
import Register from './pages/register/Register';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import NewVideo from './pages/newVideo/NewVideo';
import User from './pages/user/User';
import Watch from './pages/watch/Watch';
import NewPlaylist from './pages/newPlaylist/NewPlaylist';
import Video from './pages/video/Video';
import Playlists from './pages/playlists/Playlists';
import Pricing from './pages/pricing/Pricing';
import VideoList from './pages/videoList/VideoList';


const App = () => {
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
	AuthService.rehydrate(); // Query localStorage ; Single Source of Truth
	setAuthReady(true);
    }, []);

    const renderPublic = (component) => {
	if (!authReady) {
	    return <div className='auth-loading'>
		       Loading...
		   </div>;
	}

	return AuthService.isAuthenticated() ? <Home /> : component;
    };

    const RootLayout = () => (
	<div className='app-shell'>
	    <Outlet />
	</div>
    );

    const router = createBrowserRouter(
	createRoutesFromElements(
	    <Route path='/'
		   element={<RootLayout />}
		   errorElement={<RouteError />}
	    >
		<Route path='register' element={
			   renderPublic(<Register />)
		       } />
		<Route path='login' element={
			   renderPublic(<Login />)
		       } />
		<Route index element={
			   <PrivateRoute isReady={authReady}>
			       <Home />
			   </PrivateRoute>
		       } />
		<Route path='about' element={<About />} />
		<Route path='videos' element={
			   <PrivateRoute isReady={authReady}>
			       <Home category='video'/>
			   </PrivateRoute>
		       } />
		<Route path='ai-analysis' element={
			   <PrivateRoute isReady={authReady}>
			       <Home category='analysis'/>
			   </PrivateRoute>
		       } />
		<Route path='watch/:videoId' element={
			   <PrivateRoute isReady={authReady}>
			       <Watch />
			   </PrivateRoute>
		       } />
		<Route path='pricing-page' element={
			   <PrivateRoute isReady={authReady}>
			       <Pricing />
			   </PrivateRoute>
		       } />
		<Route path='profile' element={
			   <PrivateRoute isReady={authReady}>
			       <User />
			   </PrivateRoute>
		       } />
		<Route path='user' element={
			   <PrivateRoute isReady={authReady}>
			       <User />
			   </PrivateRoute>
		       } />
		<Route path='new-video' element={
			   <PrivateRoute isReady={authReady}>
			       <NewVideo />
			   </PrivateRoute>
		       } />
		<Route path='new-playlist' element={
			   <PrivateRoute isReady={authReady}>
			       <NewPlaylist />
			   </PrivateRoute>
		       } />
		<Route path='video-list' element={
			   <PrivateRoute isReady={authReady}>
			       <VideoList />
			   </PrivateRoute>
		       } />
		<Route path='video/:id' element={
			   <PrivateRoute isReady={authReady}>
			       <Video />
			   </PrivateRoute>
		       } />
		<Route path='playlists' element={
			   <PrivateRoute isReady={authReady}>
			       <Playlists />
			   </PrivateRoute>
		       } />
		<Route path='*' element={ <Navigate to='/' replace />} />
	    </Route>
	),
    );

    return (
	<RouterProvider router={router} />
    );
};

export default App;
