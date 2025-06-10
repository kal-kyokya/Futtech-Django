import { useState, useEffect } from 'react';
import './navbar.scss';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/userContext/UserContext';
import { logOut } from '../contexts/userContext/UserActions';
import MenuIcon from '@mui/icons-material/Menu';


const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, dispatch } = useContext(UserContext);
    const navigate = useNavigate(); // Initialize useNavigate hook

    /*
      window.onscroll = () => {
      	setIsScrolled(window.pageYOffset === 0 ? false : true);
      	return () => (window.onscroll = null);
      };
    */

    // Using useEffect for window.onscroll to prevent
    // potential memory leaks and ensure cleanup
    useEffect(() => {
	const handleScroll = () => {
	    setIsScrolled(window.pageYOffset === 0 ? false : true);
	};

	window.addEventListener('scroll', handleScroll);

	return () => {
	    window.removeEventListener('scroll', handleScroll); // Cleanup on unmount
	};
    }, []);

    const handleLogOut = () => {
	localStorage.setItem('videos', JSON.stringify([]));
	dispatch(logOut());
	setIsMobileMenuOpen(false); // Close Mobile menu on logout
    };

    const toggleMobileMenu = () => {
	setIsMobileMenuOpen(!isMobileMenuOpen); // Toggle the state
    };

    // Helper function to navigate and close menu
    const handleNavLinkClick = (path) => {
	navigate(path);
	setIsMobileMenuOpen(false); // Close mobile menu after navigation
    };

    return (
	<> {/* Use a React Fragment to wrap multiple top-level elements */}
	    <div className={isScrolled ? 'navbar scrolled' : 'navbar'}>
		<div className='container'>
		    <div className='left'>
			<Link className='link' to='/'>
			    <img src='/logo.png'
				 alt='Logo of the Futtech Company'
			    />
			</Link>

			{/* Desktop Navigation Links - These will be hidden by CSS on mobile */}
			<Link to='/' className='link desktop-nav-item'> {/* Add a class for specific hiding */}
			    <span>Home</span>
			</Link>
			<Link to='/videos' className='link desktop-nav-item'>
			    <span>Drone Footages</span>
			</Link>
			<Link to='/analysis' className='link desktop-nav-item'>
			    <span>AI-driven Analysis</span>
			</Link>
			<Link to='/about' className='link desktop-nav-item'>
			    <span>About</span>
			</Link>
		    </div>

		    {/* Hide CRUD operation buttons */}
		    <div className='right'>

			{/* Hamburger Menu Icon - Visible on mobile via CSS */}
			<div className='hamburger-menu'
				  onClick={toggleMobileMenu}
			>
			    <MenuIcon />
			    <span>Menu</span>
			</div>

			<Link className='link desktop-nav-item'
			      to='/newVideo'
			>
			    <button className='navbarButton'>
				Create
			    </button>
			</Link>
			<Link className='link desktop-nav-item'
			      to='/videoList'
			>
			    <button className='navbarButton'>
				Manage
			    </button>
			</Link>

			{/* Hide search and Notification on Mobile */}
			<SearchIcon className='icon desktop-nav-item'/>
			<NotificationsNoneIcon className='icon desktop-nav-item'/>

			<Link className='link'
			      to='/me'>
			    <img className='navbarImg'
				 src={user?.profilePic || '/BlankProfile.png'}
				 alt='Profile Picture'
			    />
			</Link>

			<div className='manage'>
			    <ArrowDropDownIcon className='optionIcon'/>
			    <div className='hiddenOptions'>
				<div className='options'>
				    { window.location.pathname !== '/me' ? (
					<Link className='link'
					      to='/me'
					      onClick={() => setIsMobileMenuOpen(false)}>  {/* Close menu if open */}
					    Profile
					</Link>
				    ) : (
					<Link className='link'
					      to='/'
					      onClick={() => setIsMobileMenuOpen(false)}>  {/* Close menu if open */}
					    Home
					</Link>
				    )}
				</div>

				<div className='options'
				     onClick={handleLogOut}
				>
				    Logout
				</div>
			    </div>
			</div>
		    </div>
		</div>
	    </div>

	    {/* Mobile Navigation Menu - Conditionally rendered/styled based on isMobileMenuOpen state */}
	    <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : 'hidden'}`}>
		<ul>
		    <li>
			<a onClick={() => handleNavLinkClick('/')}>Home</a>
		    </li>
		    <li>
			<a onClick={() => handleNavLinkClick('/videos')}>Drone Footages</a>
		    </li>
		    <li>
			<a onClick={() => handleNavLinkClick('/analysis')}>AI-driven Analysis</a>
		    </li>
		    <li>
			<a onClick={() => handleNavLinkClick('/about')}>About</a>
		    </li>
		    <li>
			<a onClick={() => handleNavLinkClick('/newVideo')}>Create Video</a>
		    </li>
		    <li>
			<a onClick={() => handleNavLinkClick('/videoList')}>Manage Videos</a>
		    </li>
		</ul>

		<a onClick={handleLogOut}
		   className='mobile-connect-button'
		>
		    Logout
		</a>
	    </div>
	</>
    );
};

export default Navbar;
