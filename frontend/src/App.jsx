import './app.scss';
import Home from './pages/home/Home';
import Register from './pages/register/Register';
import Watch from './pages/watch/Watch';
import Login from './pages/login/Login';
import Demo from './pages/demo/Demo';
import User from './pages/user/User';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/authContext/AuthContext';

const App = () => {
    const { user } = useContext(AuthContext);

    return (
	<Router>
	    <Routes>
		<Route path='/' element={
			   user ? <Home /> : <Register />
		       } />
		<Route path='/register' element={
			   user ? <Home /> : <Register />
		       } />
		<Route path='/login' element={
			   user && user.accessToken ? <Home /> : <Login />
		       } />
		<Route path='/demo' element={<Demo />} />
		{user && (
		    <>
			<Route path='/videos' element={<Home category='video'/>} />
			<Route path='/analysis' element={<Home category='analysis'/>} />
			<Route path='/watch' element={<Watch />} />
			<Route path='/user' element={<User />} />
		    </>
		)}
	    </Routes>
	</Router>
    );
};

export default App;
