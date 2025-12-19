import './app.scss';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate } from 'react-router-dom';
import AuthService from './services/authService';

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

    return (
	<Router>
	    <Routes>
		<Route path='/register' element={
			   AuthService.isAuthenticated() ?
			       <Home /> : <Register />
		       } />
		<Route path='/login' element={
			   AuthService.isAuthenticated() ?
			       <Home /> : <Login />
		       } />
		<Route path='/' element={
			   AuthService.isAuthenticated() ?
			       <Home /> : <Register />
		       } />
		<Route path='/about' element={<About />} />
		<Route path='/videos' element={
			   AuthService.isAuthenticated() ?
			       <Home category='video'/> : <Navigate to='/' />
		       } />
		<Route path='/ai-analysis' element={
			   AuthService.isAuthenticated() ?
			       <Home category='analysis'/> : <Navigate to='/' />
		       } />
		<Route path='/watch' element={
			   AuthService.isAuthenticated() ?
			       <Watch /> : <Navigate to='/' />
		       } />
		<Route path='/pricing-page' element={
			   AuthService.isAuthenticated() ?
			       <Pricing /> : <Navigate to='/' />
		       } />
		<Route path='/profile' element={
			   AuthService.isAuthenticated() ?
			       <User /> : <Navigate to='/' />
		       } />
		<Route path='/new-video' element={
			   AuthService.isAuthenticated() ?
			       <NewVideo /> : <Navigate to='/' />
		       } />
		<Route path='/new-list' element={
			   AuthService.isAuthenticated() ?
			       <NewList /> : <Navigate to='/' />
		       } />
		<Route path='/video-list' element={
			   AuthService.isAuthenticated() ?
			       <VideoList /> : <Navigate to='/' />
		       } />
		<Route path='/video/:id' element={
			   AuthService.isAuthenticated() ?
			       <Video /> : <Navigate to='/' />
		       } />
		<Route path='/lists' element={
			   AuthService.isAuthenticated() ?
			       <Lists /> : <Navigate to='/' />
		       } />
		<Route path='*' element={ <Navigate to='/' />} />
	    </Routes>
	</Router>

    );
};

export default App;
