import { useState } from 'react';
import './navbar.scss';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/userContext/UserContext';
import { logOut } from '../contexts/userContext/UserActions';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, dispatch } = useContext(UserContext);

    window.onscroll = () => {
	setIsScrolled(window.pageYOffset === 0 ? false : true);
	return () => (window.onscroll = null);
    };

    const handleLogOut = () => {
	localStorage.setItem('videos', JSON.stringify([]));
	dispatch(logOut());
    };

    return (
	<div className={isScrolled ? 'navbar scrolled' : 'navbar'}>
	    <div className='container'>
		<div className='left'>
		    <Link className='link' to='/'>
			<img src='/logo.png'
			     alt='Logo of the Futtech Company'
			/>
		    </Link>
		    <Link to='/' className='link'>
			<span>Home</span>
		    </Link>
		    <Link to='/videos' className='link'>
			<span>Drone Footages</span>
		    </Link>
		    <Link to='/analysis' className='link'>
			<span>AI-driven Analysis</span>
		    </Link>
		    <Link to='/' className='link'>
			<span>New & Popular</span>
		    </Link>
		</div>

		<div className='right'>
			<Link className='link'
			      to='/newVideo'
			>
			    <button className='newVideoButton'>
				Create
			    </button>
			</Link>
			<Link className='link'
			      to='/videoList'
			>
			    <button className='newVideoButton'>
				Manage
			    </button>
			</Link>
		    <SearchIcon className='icon'/>
		    <NotificationsNoneIcon className='icon'/>
		    <Link className='link'
			  to='/me'>
			<img src={user.profilePic}
			     alt='Profile Picture'
			/>
		    </Link>
		    <div className='manage'>
			<ArrowDropDownIcon className='optionIcon'/>
			<div className='hiddenOptions'>
			    <div className='options'>
				{ window.location.pathname !== '/me' ? (
				    <Link className='link' to='/me'>
					Profile
				    </Link>
				) : (
				    <Link className='link' to='/'>
					Home
				    </Link>
				)}
			    </div>

			    <div className='options'
				 onClick={handleLogOut}>
				    Logout
			    </div>
			</div>
		    </div>
		</div>
	    </div>
	</div>
    );
}

export default Navbar;
