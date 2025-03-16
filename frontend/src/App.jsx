import './app.scss';
import Home from './pages/home/Home';
import Register from './pages/register/Register';
import Watch from './pages/watch/Watch';
import Login from './pages/login/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
    const user = true;

    return (
	<Router>
	    <Routes>
		<Route path='/' element={
			   user ? <Home /> : <Register />
		       } />
		<Route path='/register' element={
			   !user ? <Register /> : <Home />
		       } />
		<Route path='/login' element={
			   !user ? <Login /> : <Home />
		       } />
		{user && (
		    <>
			<Route path='/videos' element={<Home category='video'/>} />
			<Route path='/analysis' element={<Home category='analysis'/>} />
			<Route path='/watch' element={<Watch />} />
		    </>
		)}
	    </Routes>
	</Router>
    );
};

export default App;
