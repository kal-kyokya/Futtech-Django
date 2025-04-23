import './app.scss';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './contexts/userContext/UserContext';
import Home from './pages/home/Home';
import Register from './pages/register/Register';
import Watch from './pages/watch/Watch';
import Login from './pages/login/Login';
import Demo from './pages/demo/Demo';
import User from './pages/user/User';
import NewVideo from './pages/newVideo/NewVideo';
import NewList from './pages/newList/NewList';
import VideoList from './pages/videoList/VideoList';
import Video from './pages/video/Video';
import Lists from './pages/lists/Lists';

const App = () => {
    const { user } = useContext(UserContext);

    return (
	<Router>
	    <Routes>
		<Route path='/' element={
			   user && user.accessToken ?
			       <Home /> : <Register />
		       } />
		<Route path='/register' element={
			   user && user.accessToken ?
			       <Home /> : <Register />
		       } />
		<Route path='/login' element={
			   user && user.accessToken ?
			       <Home /> : <Login />
		       } />
		<Route path='/demo' element={<Demo />} />
		<Route path='/videos' element={
			   user && user.accessToken ?
			       <Home category='video'/> : <Navigate to='/' />
		       } />
		<Route path='/analysis' element={
			   user && user.accessToken ?
			       <Home category='analysis'/> : <Navigate to='/' />
		       } />
		<Route path='/watch' element={
			   user && user.accessToken ?
			       <Watch /> : <Navigate to='/' />
		       } />
		<Route path='/me' element={
			   user && user.accessToken ?
			       <User /> : <Navigate to='/' />
		       } />
		<Route path='/newVideo' element={
			   user && user.accessToken ?
			       <NewVideo /> : <Navigate to='/' />
		       } />
		<Route path='/newList' element={
			   user && user.accessToken ?
			       <NewList /> : <Navigate to='/' />
		       } />
		<Route path='/videoList' element={
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
