import './user.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useMemo, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { UserContext } from '../../contexts/userContext/UserContext';
import {
    updateStart,
    updateSuccess,
    updateFailure
} from '../../contexts/userContext/UserActions';
import apiClient from '../../services/apiClient';

const User = () => {
    const { user, dispatch } = useContext(UserContext);
    const navigate = useNavigate();

    const [updatedUser, setUpdatedUser] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const birthdayValue = useMemo(() => user?.birthday?.split('T')[0] || '', [user?.birthday]);

    const handleChange = (event) => {
	const { name, value } = event.target;
	setUpdatedUser((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
	event.preventDefault();
	const userId = user?._id || user?.id;
	if (!userId) {
	    return;
	}

	setIsSaving(true);
	dispatch(updateStart());

	try {
	    const response = await apiClient.put(`/users/${userId}/`, updatedUser);
	    dispatch(updateSuccess({
		...user,
		...response.data,
		_id: response.data?.id || user._id || user.id,
		id: response.data?.id || user.id || user._id,
		accessToken: user.accessToken,
	    }));
	    navigate('/profile');
	} catch (error) {
	    console.error('Failed to update profile:', error?.normalized || error);
	    dispatch(updateFailure(error?.normalized || error));
	} finally {
	    setIsSaving(false);
	}
    };

    return (
	<>
	    <Navbar />
	    <div className='user'>
		<div className='userTopSection'>
		    <h1 className='userEditTitle'>Profile</h1>
		</div>

		<div className='userContainer'>
		    <div className='userDetails'>
			<div className='userDetailsTop'>
			    <img
				className='profile'
				src={user?.profilePic}
				alt='Profile Pic'
			    />
			    <div className='userInfos'>
				<div className='userNames'>{ `${user?.firstName || ''} ${user?.lastName || ''}`.trim() }</div>
				<div className='userTitle'>{ user?.profession }</div>
			    </div>
			</div>

			<div className='userDetailsBottom'>
			    <span className='userDetailsTitle'>Account details</span>
			    <div className='userDetailsDiv'>
				<PermIdentityIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user?.username }</div>
			    </div>
			    <div className='userDetailsDiv'>
				<SportsSoccerIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>
				    { (user?.sex && user.sex !== 'Sex') ? `${user.sex} | ` : '' }{ user?.position }
				</div>
			    </div>
			    <div className='userDetailsDiv'>
				<CalendarMonthOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ birthdayValue }</div>
			    </div>

			    <span className='userDetailsTitle'>Contact details</span>
			    <div className='userDetailsDiv'>
				<EmailOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user?.email }</div>
			    </div>
			    <div className='userDetailsDiv'>
				<LocalPhoneOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user?.phone }</div>
			    </div>
			    <div className='userDetailsDiv'>
				<LocationOnOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user?.location }</div>
			    </div>
			</div>
		    </div>

		    <div className='userUpdate'>
			<div className='userUpdateTitle'>Edit profile</div>
			<form className='userUpdateForm' onSubmit={handleSubmit}>
			    <div className='userUpdateLeft'>
				{[
				    ['firstName', 'First Name', user?.firstName || ''],
				    ['lastName', 'Last Name', user?.lastName || ''],
				    ['username', 'Username', user?.username || ''],
				    ['profession', 'Profession', user?.profession || ''],
				    ['phone', 'Phone', user?.phone || ''],
				    ['location', 'Location', user?.location || ''],
				].map(([name, label, placeholder]) => (
				    <div className='userUpdateItem' key={name}>
					<label>{label}</label>
					<input
					    type='text'
					    className='userUpdateInput'
					    name={name}
					    placeholder={placeholder}
					    onChange={handleChange}
					/>
				    </div>
				))}

				<div className='userUpdateItem'>
				    <label>Position</label>
				    <select className='userUpdateInput' name='position' onChange={handleChange} id='position'>
					<option value='observer'>Observer</option>
					<option value='coach'>Coach</option>
					<option value='Position'>Select</option>
					<option value='goalkeeper'>Goalkeeper</option>
					<option value='sweeper'>Sweeper</option>
					<option value='center-back'>Center-Back</option>
					<option value='full-back'>Full-Back</option>
					<option value='wing-back'>Wing-Back</option>
					<option value='defensive midfielder'>Defensive Midfielder</option>
					<option value='central midfielder'>Central Midfielder</option>
					<option value='attacking midfielder'>Attacking Midfielder</option>
					<option value='winger'>Winger</option>
					<option value='striker'>Striker</option>
					<option value='striker'>Striker</option>
				    </select>
				</div>

				<div className='userUpdateItem'>
				    <label>Sex</label>
				    <select className='userUpdateInput' name='sex' onChange={handleChange} id='sex'>
					<option value='Sex'>Select</option>
					<option value='Male'>Male</option>
					<option value='Female'>Female</option>
				    </select>
				</div>

				<div className='userUpdateItem'>
				    <label>Birthday</label>
				    <input
					type='date'
					className='userUpdateInput'
					name='birthday'
					defaultValue={birthdayValue}
					onChange={handleChange}
				    />
				</div>
			    </div>

			    <div className='userUpdateRight'>
				<button className='userUpdateButton' type='submit' disabled={isSaving}>
				    { isSaving ? 'Saving...' : 'Update'}
				</button>
			    </div>
			</form>
		    </div>
		</div>
	    </div>
	</>
    );
};

export default User;
