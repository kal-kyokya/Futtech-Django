import './app.scss';
import { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate } from 'react-router-dom';
import AuthService from './services/authService';
import PrivateRoute from './components/privateRoute/PrivateRoute';

import About from './pages/about/About';
import Register from './pages/register/Register';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import NewVideo from './pages/newVideo/NewVideo';
import User from './pages/user/User';
import Watch from './pages/watch/Watch';
import NewList from './pages/newList/NewList';
import Video from './pages/video/Video';
import Lists from './pages/lists/Lists';
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

    return (
	<Router>
	    <Routes>
		<Route path='/register' element={
			   renderPublic(<Register />)
		       } />
		<Route path='/login' element={
			   renderPublic(<Login />)
		       } />
		<Route path='/' element={
			   <PrivateRoute isReady={authReady}>
			       <Home />
			   </PrivateRoute>
		       } />
		<Route path='/about' element={<About />} />
		<Route path='/videos' element={
			   <PrivateRoute isReady={authReady}>
			       <Home category='video'/>
			   </PrivateRoute>
		       } />
		<Route path='/ai-analysis' element={
			   <PrivateRoute isReady={authReady}>
			       <Home category='analysis'/>
			   </PrivateRoute>
		       } />
		<Route path='/watch' element={
			   <PrivateRoute isReady={authReady}>
			       <Watch />
			   </PrivateRoute>
		       } />
		<Route path='/pricing-page' element={
			   <PrivateRoute isReady={authReady}>
			       <Pricing />
			   </PrivateRoute>
		       } />
		<Route path='/profile' element={
			   <PrivateRoute isReady={authReady}>
			       <User />
			   </PrivateRoute>
		       } />
		<Route path='/user' element={
			   <PrivateRoute isReady={authReady}>
			       <User />
			   </PrivateRoute>
		       } />
		<Route path='/new-video' element={
			   <PrivateRoute isReady={authReady}>
			       <NewVideo />
			   </PrivateRoute>
		       } />
		<Route path='/new-list' element={
			   <PrivateRoute isReady={authReady}>
			       <NewList />
			   </PrivateRoute>
		       } />
		<Route path='/video-list' element={
			   <PrivateRoute isReady={authReady}>
			       <VideoList />
			   </PrivateRoute>
		       } />
		<Route path='/video/:id' element={
			   <PrivateRoute isReady={authReady}>
			       <Video />
			   </PrivateRoute>
		       } />
		<Route path='/lists' element={
			   <PrivateRoute isReady={authReady}>
			       <Lists />
			   </PrivateRoute>
		       } />
		<Route path='*' element={ <Navigate to='/' replace />} />
	    </Routes>
	</Router>

    );
};

export default App;
