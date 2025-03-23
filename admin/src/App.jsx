import './app.scss';
import Topbar from './components/topbar/Topbar';
import Sidebar from './components/sidebar/Sidebar';
import Home from './pages/home/Home';
import Insights from './pages/insights/Insights';
import UserList from './pages/userList/UserList';
import VideoList from './pages/videoList/VideoList';
import User from './pages/user/User';
import NewUser from './pages/newUser/NewUser';
import NewVideo from './pages/newVideo/NewVideo';
import Video from './pages/videos/Videos';
import Support from './pages/support/Support';
import Account from './pages/account/Account';
import About from './pages/about/About';
import Lists from './pages/lists/Lists';
import Statistics from './pages/statistics/Statistics';
import Login from './pages/login/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/authContext/AuthContext';

function App() {
    const { user } = useContext(AuthContext);
    return (
	<Router>
	    <Routes>
		<Route path='/login' element={!user ? <Home /> : <Login /> } />
	    </Routes>

	    {!user ? (
		<>
		    <Topbar />
		    <div className='container'>
			<Sidebar />
			<Routes>
			    <Route path='/' element={<Home />} />
			    <Route path='/users' element={<UserList />} />
			    <Route path='/videos' element={<VideoList />} />
			    <Route path='/newUser' element={<NewUser />} />
			    <Route path='/newVideo' element={<NewVideo />} />
			    <Route path='/user/:id' element={<User />} />
			    <Route path='/video/:id' element={<Video />} />
			    <Route path='/insights' element={<Insights />} />
			    <Route path='/support' element={<Support />} />
			    <Route path='/account' element={<Account />} />
			    <Route path='/about' element={<About />} />
			    <Route path='/lists' element={<Lists />} />
			    <Route path='/statistics' element={<Statistics />} />
			</Routes>
		    </div>
		</>
	    ) : <Login />
	    }
	</Router>
    );
}

export default App;
