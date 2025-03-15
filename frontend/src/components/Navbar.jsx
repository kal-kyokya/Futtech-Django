import { useState } from 'react';
import './navbar.scss';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    window.onscroll = () => {
	setIsScrolled(window.pageYOffset === 0 ? false : true);
	return () => (window.onscroll = null);
    };

    return (
	<div className={isScrolled ? 'navbar scrolled' : 'navbar'}>
	    <div className='container'>
		<div className='left'>
		    <img src='../../public/logo.png'
			 alt='Logo of the Futtech Company'/>
		    <span>Home</span>
		    <span>Drone Footages</span>
		    <span>AI-driven Analysis</span>
		    <span>New & Popular</span>
		</div>

		<div className='right'>
		    <SearchIcon className='icon'/>
		    <NotificationsNoneIcon className='icon'/>
		    <img src='../../public/profile.JPG'
			 alt='Icon categorizing user as player, coach or scout'/>
		    <div className='profile'>
			<ArrowDropDownIcon className='icon'/>
			<div className='options'>
			    <span>Settings</span>
			    <span>Logout</span>
			</div>
		    </div>
		</div>
	    </div>
	</div>
    );
}

export default Navbar;
