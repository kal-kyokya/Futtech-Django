import './user.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { UserContext } from '../../contexts/userContext/UserContext';
import {
    updateStart,
    updateSuccess,
    updateFailure,
} from '../../contexts/userContext/UserActions';
import apiClient, { normalizeError } from '../../services/apiClient';

const User = () => {
    const { user, dispatch } = useContext(UserContext);
    const navigate = useNavigate();

    const [updatedUser, setUpdatedUser] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const birthdayValue = useMemo(
	() => user?.birthday?.split('T')[0] || '',
	[user?.birthday],
    );

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

	setError('');
	setFieldErrors({});
	setIsProcessing(true);
	dispatch(updateStart());

	try {
	    const response = await apiClient.put(`/users/${userId}/`, updatedUser);
	    dispatch(
		updateSuccess({
		    ...user,
		    ...response.data,
		    _id: response.data?.id || user._id || user.id,
		    id: response.data?.id || user.id || user._id,
		}),
	    );
	    navigate('/profile');
	} catch (error) {
	    const normalized = error?.normalized || normalizeError(error);
	    setFieldErrors(normalized.fields || {});
	    setError(
		normalized.fields
		    ? 'Please check the highlighted fields.'
		    : normalized.message ||
		    'We could not save your profile. Please try again.',
	    );
	    dispatch(updateFailure(error?.normalized || error));
	} finally {
	    setIsProcessing(false);
	}
    };

    return (
	<>
	    <Navbar />
	    <main id='main-content' tabIndex={-1} className='user page-container'>
		<div className='userTopSection'>
		    <h1 className='userEditTitle'>Profile</h1>
		</div>

		<div className='userContainer'>
		    <div className='userDetails'>
			<div className='userDetailsTop'>
			    <img
				className='profile'
				src={user?.profilePic || '/BlankProfile.png'}
				alt='Profile Pic'
			    />
			    <div className='userInfos'>
				<div className='userNames'>
				    {`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
				</div>
				<div className='userTitle'>{user?.profession}</div>
			    </div>
			</div>

			<div className='userDetailsBottom'>
			    <span className='userDetailsTitle'>Account details</span>
			    <div className='userDetailsDiv'>
				<PermIdentityIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{user?.username}</div>
			    </div>
			    <div className='userDetailsDiv'>
				<SportsSoccerIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>
				    {user?.sex && user.sex !== 'Sex' ? `${user.sex} | ` : ''}
				    {user?.position}
				</div>
			    </div>
			    <div className='userDetailsDiv'>
				<CalendarMonthOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{birthdayValue}</div>
			    </div>

			    <span className='userDetailsTitle'>Contact details</span>
			    <div className='userDetailsDiv'>
				<EmailOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{user?.email}</div>
			    </div>
			    <div className='userDetailsDiv'>
				<LocalPhoneOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{user?.phone}</div>
			    </div>
			    <div className='userDetailsDiv'>
				<LocationOnOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{user?.location}</div>
			    </div>
			</div>
		    </div>

		    <div className='userUpdate'>
			{error && (
			    <p role='alert' className='status-message'>
				{error}
			    </p>
			)}
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
					<label htmlFor={`profile-${name}`}>{label}</label>
					<input
					    type={name === 'phone' ? 'tel' : 'text'}
					    id={`profile-${name}`}
					    aria-invalid={Boolean(fieldErrors[name])}
					    aria-describedby={
						fieldErrors[name] ? `profile-${name}-error` : undefined
					    }
					    defaultValue={placeholder}
					    className='userUpdateInput'
					    name={name}
					    placeholder={placeholder}
					    onChange={handleChange}
					/>
					{fieldErrors[name] && (
					    <p className='fieldError' id={`profile-${name}-error`}>
						{fieldErrors[name]}
					    </p>
					)}
				    </div>
				))}

				<div className='userUpdateItem'>
				    <label htmlFor='position'>Position</label>
				    <select
					className='userUpdateInput'
					name='position'
					defaultValue={user?.position || 'observer'}
					onChange={handleChange}
					id='position'
					aria-invalid={Boolean(fieldErrors.position)}
					aria-describedby={
					    fieldErrors.position
						? 'profile-position-error'
						: undefined
					}
				    >
					<option value='observer'>Observer</option>
					<option value='coach'>Coach</option>
					<option value='Position'>Select</option>
					<option value='goalkeeper'>Goalkeeper</option>
					<option value='sweeper'>Sweeper</option>
					<option value='center-back'>Center-Back</option>
					<option value='full-back'>Full-Back</option>
					<option value='wing-back'>Wing-Back</option>
					<option value='defensive midfielder'>
					    Defensive Midfielder
					</option>
					<option value='central midfielder'>
					    Central Midfielder
					</option>
					<option value='attacking midfielder'>
					    Attacking Midfielder
					</option>
					<option value='winger'>Winger</option>
					<option value='striker'>Striker</option>
				    </select>
				    {fieldErrors.position && (
					<p className='fieldError' id='profile-position-error'>
					    {fieldErrors.position}
					</p>
				    )}
				</div>

				<div className='userUpdateItem'>
				    <label htmlFor='sex'>Sex</label>
				    <select
					className='userUpdateInput'
					name='sex'
					defaultValue={
					    user?.sex === 'male'
						? 'Male'
						: user?.sex === 'female'
						? 'Female'
						: 'Sex'
					}
					onChange={handleChange}
					id='sex'
					aria-invalid={Boolean(fieldErrors.sex)}
					aria-describedby={
					    fieldErrors.sex ? 'profile-sex-error' : undefined
					}
				    >
					<option value='Sex'>Select</option>
					<option value='Male'>Male</option>
					<option value='Female'>Female</option>
				    </select>
				    {fieldErrors.sex && (
					<p className='fieldError' id='profile-sex-error'>
					    {fieldErrors.sex}
					</p>
				    )}
				</div>

				<div className='userUpdateItem'>
				    <label htmlFor='birthday'>Birthday</label>
				    <input
					id='birthday'
					aria-invalid={Boolean(fieldErrors.birthday)}
					aria-describedby={
					    fieldErrors.birthday
						? 'profile-birthday-error'
						: undefined
					}
					type='date'
					className='userUpdateInput'
					name='birthday'
					defaultValue={birthdayValue}
					onChange={handleChange}
				    />
				    {fieldErrors.birthday && (
					<p className='fieldError' id='profile-birthday-error'>
					    {fieldErrors.birthday}
					</p>
				    )}
				</div>
			    </div>

			    <div className='userUpdateRight'>
				<button
				    className='userUpdateButton'
				    type='submit'
				    disabled={isProcessing}
				>
				    {isProcessing ? 'Processing...' : 'Save changes'}
				</button>
			    </div>
			</form>
		    </div>
		</div>
	    </main>
	</>
    );
};

export default User;
