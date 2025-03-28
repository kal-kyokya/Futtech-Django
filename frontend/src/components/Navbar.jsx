import { useState } from 'react';
import './navbar.scss';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext/AuthContext';
import { logOut } from '../contexts/authContext/AuthActions';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, dispatch } = useContext(AuthContext);

    window.onscroll = () => {
	setIsScrolled(window.pageYOffset === 0 ? false : true);
	return () => (window.onscroll = null);
    };

    return (
	<div className={isScrolled ? 'navbar scrolled' : 'navbar'}>
	    <div className='container'>
		<div className='left'>
		    <img src='/logo.png'
			 alt='Logo of the Futtech Company'/>
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
		    <SearchIcon className='icon'/>
		    <NotificationsNoneIcon className='icon'/>
		    <img src={user.profilePic}
			 alt='Profile Picture'/>
		    <div className='manage'>
			<ArrowDropDownIcon className='optionIcon'/>
			<div className='hiddenOptions'>
			    <div className='options'>
				{ window.location.pathname !== '/user' ? (
				    <Link className='link' to='/user'>
					Profile
				    </Link>
				) : (
				    <Link className='link' to='/'>
					Home
				    </Link>
				)}
			    </div>

			    <div className='options'
				 onClick={() => dispatch(logOut())}>
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
