import './home.scss';
import Navbar from '../../components/Navbar';
import Featured from '../../components/featured/Featured';
import List from '../../components/list/List';
import Watch from '../../pages/watch/Watch';
import Register from '../../pages/register/Register';
import Login from '../../pages/login/Login';

const Home = () => {
    return (
	<div className='home'>
	    <Login />
	</div>
    );
}

export default Home;
