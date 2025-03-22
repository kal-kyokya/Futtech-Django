import './topbar.scss';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/authContext/AuthContext';
import { logOut } from '../../contexts/authContext/AuthActions';

const Topbar = () => {
    const { dispatch } = useContext(AuthContext);

    return (<div className='topbar'>
		<div className='topBarWrapper'>
		    <div className='topLeft'>
			<div className='logo'>
			    <span className='fut'>Fut</span>
			    <span className='tech'>tech </span>
			    | Admin
			</div>
		    </div>

		    <div className='topRight'>
			<div className='topRightIcons'>
			    <NotificationsNoneIcon />
			    <span className='topIconBadge'>6</span>
			</div>
			<div className='topRightIcons'>
			    <LanguageIcon />
			    <span className='topIconBadge'>7</span>
			</div>
			<div className='topRightIcons'>
			    <SettingsIcon />
			</div>
			<img className='profileImg'
			     src='/profile1.JPG'
			     alt='User profile'
			/>
			<div className='profile'>
			    <ArrowDropDownIcon className='icon'/>
			    <div className='hiddenOptions'>
				<Link className='link' to='/user/0'>
				    <div className='options'>Profile</div>
				</Link>
				<div className='options'
				     onClick={() => dispatch(logOut())}>Logout</div>
			    </div>
			</div>
		    </div>
		</div>
	    </div>);
}

export default Topbar;
