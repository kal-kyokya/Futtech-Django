import './app.scss';
import Home from './pages/home/Home';
import Register from './pages/register/Register';
import Watch from './pages/watch/Watch';
import Login from './pages/login/Login';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const App = () => {
    return (
	<Router>
	    <Routes>
		<Route path='/' element={<Home />} />
		<Route path='/register' element={<Register />} />
		<Route path='/login' element={<Login />} />
		<Route path='/videos' element={<Home category='video'/>} />
		<Route path='/analysis' element={<Home category='analysis'/>} />
		<Route path='/watch' element={<Watch />} />
	    </Routes>
	</Router>
    );
};

export default App;
