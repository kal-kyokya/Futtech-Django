import './app.scss';
import Home from './pages/home/Home';
import Register from './pages/register/Register';
import Watch from './pages/watch/Watch';
import Login from './pages/login/Login';
import Demo from './pages/demo/Demo';
import User from './pages/user/User';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './contexts/userContext/UserContext';

const App = () => {
    const { user } = useContext(UserContext);

    return (
	<Router>
	    <Routes>
		<Route path='/' element={
			   user && user.accessToken ? <Home /> : <Register />
		       } />
		<Route path='/register' element={
			   user && user.accessToken ? <Home /> : <Register />
		       } />
		<Route path='/login' element={
			   user && user.accessToken ? <Home /> : <Login />
		       } />
		<Route path='/demo' element={<Demo />} />
		<Route path='/videos' element={
			   user && user.accessToken ? <Home category='video'/> : <Login />
		       } />
		<Route path='/analysis' element={
			   user && user.accessToken ? <Home category='analysis'/> : <Login />
		       } />
		<Route path='/watch' element={
			   user && user.accessToken ? <Watch /> : <Login />
		       } />
		<Route path='/user' element={
			   user && user.accessToken ? <User /> : <Login />
		       } />
		{/*<Route path='*' element={ <Navigate to='/' />} />*/}
	    </Routes>
	</Router>
    );
};

export default App;
