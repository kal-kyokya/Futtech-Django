import './widgetSmall.scss';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState, useEffect } from 'react';
import axios from 'axios';

const WidgetSmall = () => {
    const [newUsers, setNewUsers] = useState([]);

    useEffect(() => {
	const getNewUsers = async () => {
	    try {
		const res = await axios.get('/users?newest=true', {
		    headers: {
			token: ''
		    }
		});
		setNewUsers(res.data);
	    } catch (err) {
		console.log(err);
	    }
	};
	
	getNewUsers();
    }, [newUsers]);

    return (
	<div className='widgetSmall'>
	    <span className='widgetSmallTitle'>New users</span>
	    <ul className='widgetSmallList'>
		{
		    newUsers.map((user) => (
			<li className='widgetSmallItem'>
			    <img className='profile'
				 src={ user.profilePic || 'https://raw.githubusercontent.com/kal-kyokya/react-admin-panel/757001cfffa81dc9957e7dde0eea61417824d9d7/public/logo.png' }
				 alt='User Profile'
			    />
			    <div className='widgetSmallUser'>
				<span className='widgetSmallUsername'>
				    { user.username }
				</span>
				<span className='widgetSmallUserTitle'>
				    { user.position }
				</span>
			    </div>
			    <button className='widgetSmallButton'>
				<VisibilityIcon className='widgetSmallIcon' />
				Display
			    </button>
			</li>

		    ))
		}
	    </ul>
	</div>
    );
}

export default WidgetSmall;
