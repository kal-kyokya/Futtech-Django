import './user.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { UserContext } from '../../contexts/userContext/UserContext';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import {
    updateUserStart,
    updateUserSuccess,
    updateUserFailure } from '../../contexts/userContext/UserActions';
import storage from '../../firebase';
import {
    getDownloadURL,
    ref as storageRef,
    uploadBytes } from 'firebase/storage';

const User = () => {
    const [updatedUser, setUpdatedUser] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const [url, setUrl] = useState(null);
    const { user, dispatch } = useContext(UserContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
	setUpdatedUser((prev) => {
	    return ({ ...prev, [e.target.name]: e.target.value });
	});
    };

    const firebaseUpload = (file) => {
	if (!file) {
	    console.error('No profile picture uploaded');
	}

	const username = updatedUser?.username || user?.username || 'anonymous';
	const date = new Date().toLocaleDateString('de-DE');
	const pictureName = file.name.split('.')[0];
	const filename = `profile_${username}_${date}_${pictureName}`;
	const imageRef = storageRef(storage, `futtech-files/${filename}`);

	uploadBytes(imageRef, file)
	    .then((snapshot) => {
		getDownloadURL(snapshot.ref)
		    .then((url) => {
			setUrl(url);
		    })
		    .catch((err) => {
			console.error(err);
		    });
	    })
	    .catch((err) => {
		console.error(err);
	    });
    };

    const handleUpload = (e) => {
	e.preventDefault();
	const file = e.target.files[0];

	if (file) {
	    setProfilePic(file);
	    firebaseUpload(file);
	};
    }

    const handleSubmit = async (e) => {
	e.preventDefault();
	dispatch(updateUserStart());

	try {
	    const res = await axios.put(`/users/${user._id}`,
					{
					    ...updatedUser,
					    'profilePic': url
					},
					{
					    headers: {
						'auth-token': user.accessToken,
					    }
					});

	    dispatch(updateUserSuccess(
		{
		    ...res.data,
		    accessToken: user.accessToken
		}
	    ));

	    navigate('/user');
	} catch (err) {
	    console.log(err.response.data);
	}

	dispatch(updateUserFailure());
    };

    return (
	<>
	    <Navbar />
	    <div className='user'>
		<div className='userTopSection'>
		    <h1 className='userEditTitle'>User Profile</h1>
		</div>

		<div className='userContainer'>
		    <div className='userDetails'>

			<div className='userDetailsTop'>
			    <img className='profile'
				 src={user.profilePic}
				 alt='Profile Pic'
			    />
			    <div className='userInfos'>
				<div className='userNames'>{ `${user.firstName} ${user.lastName}` }</div>
				<div className='userTitle'>{ user.profession }</div>
			    </div>
			</div>

			<div className='userDetailsBottom'>
			    <span className='userDetailsTitle'>Account details</span>
			    <div className='userDetailsDiv'>
				<PermIdentityIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user.username }</div>
			    </div>
			    <div className='userDetailsDiv'>
				<SportsSoccerIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user.position }</div>
			    </div>
			    <div className='userDetailsDiv'>
				<CalendarMonthOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user.birthday }</div>
			    </div>
			    <span className='userDetailsTitle'>Contact details</span>
			    <div className='userDetailsDiv'>
				<EmailOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user.email }</div>
			    </div>
			    <div className='userDetailsDiv'>
				<LocalPhoneOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user.phone }</div>
			    </div>
			    <div className='userDetailsDiv'>
				<LocationOnOutlinedIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user.location }</div>
			    </div>
			</div>
		    </div>

		    <div className='userUpdate'>
			<div className='userUpdateTitle'>Edit</div>
			<form className='userUpdateForm'>
			    <div className='userUpdateLeft'>
				<div className='userUpdateItem'>
				    <label>First Name</label>
				    <input type='text'
					   placeholder={ user.firstName }
					   className='userUpdateInput'
					   name='firstName'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Last Name</label>
				    <input type='text'
					   placeholder={ user.lastName }
					   className='userUpdateInput'
					   name='lastName'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Username</label>
				    <input type='text'
					   placeholder={ user.username }
					   className='userUpdateInput'
					   name='username'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Position</label>
				    <input type='text'
					   placeholder={ user.position }
					   className='userUpdateInput'
					   name='position'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Profession</label>
				    <input type='text'
					   placeholder={ user.profession }
					   className='userUpdateInput'
					   name='profession'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Phone</label>
				    <input type='text'
					   placeholder={ user.phone }
					   className='userUpdateInput'
					   name='phone'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Location</label>
				    <input type='text'
					   placeholder={ user.location }
					   className='userUpdateInput'
					   name='location'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Active Footballer?</label>
				    <select className='userUpdateInput'
					    name='career'
					    onChange={handleChange}
					    id='career'
				    >
					<option>Select</option>
					<option value='true'>Yes</option>
					<option value='false'>No</option>
				    </select>
				</div>
			    </div>

			    <div className='userUpdateRight'>
				<div className='userUpdateUpload'>
				    <img className='userUpdateImg'
					 src={user.profilePic}
					 alt='User Profile'
				    />
				    <label htmlFor='file'>
					<PublishIcon className='userUpdateIcon' />
				    </label>
				    <input id='file'
					   type='file'
					   style={{ display: 'none' }}
					   name='profilePic'
					   onChange={handleUpload}
				    />
				</div>
				<button className='userUpdateButton'
					onClick={handleSubmit}
				>
				    Update
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
