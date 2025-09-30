import './app.scss';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './contexts/userContext/UserContext';
import About from './pages/about/About';
import Register from './pages/register/Register';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import NewVideo from './pages/newVideo/NewVideo';
import VideoList from './pages/videoList/VideoList';
import User from './pages/user/User';
import Watch from './pages/watch/Watch';
import NewList from './pages/newList/NewList';
import Video from './pages/video/Video';
import Lists from './pages/lists/Lists';
import Pricing from './pages/pricing';


const App = () => {
    const { user } = useContext(UserContext);

    return (
	<Router>
	    <Routes>
		<Route path='/register' element={
			   user && user.accessToken ?
			       <Home /> : <Register />
		       } />
		<Route path='/login' element={
			   user && user.accessToken ?
			       <Home /> : <Login />
		       } />
		<Route path='/' element={
			   user && user.accessToken ?
			       <Home /> : <Register />
		       } />
		<Route path='/about' element={<About />} />
		<Route path='/videos' element={
			   user && user.accessToken ?
			       <Home category='video'/> : <Navigate to='/' />
		       } />
		<Route path='/ai-analysis' element={
			   user && user.accessToken ?
			       <Home category='analysis'/> : <Navigate to='/' />
		       } />
		<Route path='/watch' element={
			   user && user.accessToken ?
			       <Watch /> : <Navigate to='/' />
		       } />
		<Route path='/pricing-page' element={
			   user && user.accessToken ?
			       <Pricing /> : <Navigate to='/' />
		       } />
		<Route path='/profile' element={
			   user && user.accessToken ?
			       <User /> : <Navigate to='/' />
		       } />
		<Route path='/new-video' element={
			   user && user.accessToken ?
			       <NewVideo /> : <Navigate to='/' />
		       } />
		<Route path='/new-list' element={
			   user && user.accessToken ?
			       <NewList /> : <Navigate to='/' />
		       } />
		<Route path='/video-list' element={
			   user && user.accessToken ?
			       <VideoList /> : <Navigate to='/' />
		       } />
		<Route path='/video/:id' element={
			   user && user.accessToken ?
			       <Video /> : <Navigate to='/' />
		       } />
		<Route path='/lists' element={
			   user && user.accessToken ?
			       <Lists /> : <Navigate to='/' />
		       } />
		<Route path='*' element={ <Navigate to='/' />} />
	    </Routes>
	</Router>

    );
};

export default App;
