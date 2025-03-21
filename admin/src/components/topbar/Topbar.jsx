import './topbar.scss';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';

const Topbar = () => {
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
			<img className='profile'
			     src='/profile1.JPG'
			     alt='User profile'
			/>
		    </div>
		</div>
	    </div>);
}

export default Topbar;
