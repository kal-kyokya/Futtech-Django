import './sidebar.scss';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import InsightsIcon from '@mui/icons-material/Insights';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
	<div className='sidebar'>
	    <div className='sidebarWrapper'>
		<div className='sidebarMenu'>
		    <h3 className='sidebarTitle'>Dashboard</h3>
		    <ul className='sidebarList'>
			<Link className='link' to='/'>
			    <li className='sidebarListItem'>
				<HomeIcon className='icon' />
				Home
			    </li>
			</Link>
			<Link className='link' to='/insights'>
			    <li className='sidebarListItem'>
				<InsightsIcon className='icon' />
				Insights
			    </li>
			</Link>
			<Link className='link' to='/statistics'>
			    <li className='sidebarListItem'>
				<QueryStatsIcon className='icon' />
				Statistics
			    </li>
			</Link>
		    </ul>
		</div>
		<div className='sidebarMenu'>
		    <h3 className='sidebarTitle'>Manage</h3>
		    <ul className='sidebarList'>
			<Link className='link' to='/lists'>
			    <li className='sidebarListItem'>
				<PlaylistPlayIcon className='icon' />
				Lists
			    </li>
			</Link>
			<Link className='link' to='/users'>
			    <li className='sidebarListItem'>
				<PeopleIcon className='icon' />
				Users
			    </li>
			</Link>
			<Link className='link' to='/videos'>
			    <li className='sidebarListItem'>
				<VideoLibraryIcon className='icon' />
				Videos
			    </li>
			</Link>
		    </ul>
		</div>
		<div className='sidebarMenu'>
		    <h3 className='sidebarTitle'>More</h3>
		    <ul className='sidebarList'>
			<Link className='link' to='/about'>
			    <li className='sidebarListItem'>
				<InfoIcon className='icon' />
				About
			    </li>
			</Link>
			<Link className='link' to='/account'>
			    <li className='sidebarListItem'>
				<AccountCircleIcon className='icon' />
				Account
			    </li>
			</Link>
			<Link className='link' to='/help'>
			    <li className='sidebarListItem'>
				<HelpIcon className='icon' />
				Help & Support
			    </li>
			</Link>
		    </ul>
		</div>
	    </div>
	</div>
    );
}

export default Sidebar;
