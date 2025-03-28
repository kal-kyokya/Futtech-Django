import './user.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { updateUser } from '../../contexts/userContext/apiCalls';
import { UserContext } from '../../contexts/userContext/UserContext';
import Navbar from '../../components/Navbar';

const User = () => {
    const [updatedUser, setUpdatedUser] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const { user, dispatch } = useContext(UserContext);

    const handleChange = (e) => {
	setUpdatedUser((prev) => {
	    return ({ ...prev, [e.target.name]: e.target.value });
	});
    };

    const firebaseUpload = (input) => {
	const filename = input.name + updateUser.username || user.username;

	const storageRef = storage.ref(`futtech-inputs/${filename}`);
	const fileToFirebase = storageRef.put(input.file);

	fileToFirebase.on(
	    'state_changed',
	    (snapshot) => {
		const progress = (snapshot.bytesTransferred / snapshot.bytesTotal) * 100;
		console.log('Upload is ' + Number(progress).toFixed(2) + '% done.');
	    },
	    (error) => {
		console.log(error);
	    },
	    () => {
		fileToFirebase.snapshot.ref.getDownloadURL()
		    .then((url) => {
			setUpdatedUser((prev) => {
			    return { ...prev, [input.name]: url }
			});
		    });
	    }
	);
    };

    const handleUpload = (e) => {
	e.preventDefault();
	setProfilePic(e.targer.files[0]);

	firebaseUpload([
	    { file: profilePic, name: 'profilePic' },
	]);
    };

    const handleSubmit = (e) => {
	e.preventDefault();

	updateUser(updatedUser, dispatch);
    };

    return (
	<>
	    <Navbar />
	    <div className='user'>
		<div className='userTopSection'>
		    <h1 className='userEditTitle'>User Profile</h1>
		    <Link to='/newUser'>
			<button className='userCreateButton'>Create user</button>
		    </Link>
		</div>

		<div className='userContainer'>
		    <div className='userDetails'>

			<div className='userDetailsTop'>
			    <img className='profile'
				 src={user.profilePic || '/BlankProfile.png'}
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
				<SportsSoccerIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user.position }</div>
			    </div>
			    <div className='userDetailsDiv'>
				<PermIdentityIcon className='userDetailsIcon' />
				<div className='userDetailsContent'>{ user.username }</div>
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
					   placeholder='Jean-Paul'
					   className='userUpdateInput'
					   name='firstName'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Last Name</label>
				    <input type='text'
					   placeholder='KYOKYA'
					   className='userUpdateInput'
					   name='lastName'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Profession</label>
				    <input type='text'
					   placeholder='Software Engineer'
					   className='userUpdateInput'
					   name='profession'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Position</label>
				    <input type='text'
					   placeholder='Striker'
					   className='userUpdateInput'
					   name='position'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Username</label>
				    <input type='text'
					   placeholder='kal-kyokya'
					   className='userUpdateInput'
					   name='username'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Email</label>
				    <input type='email'
					   placeholder='kalkyokya4@gmail.com'
					   className='userUpdateInput'
					   name='email'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Phone</label>
				    <input type='text'
					   placeholder='+254798129095'
					   className='userUpdateInput'
					   name='phone'
					   onChange={handleChange}
				    />
				</div>
				<div className='userUpdateItem'>
				    <label>Location</label>
				    <input type='text'
					   placeholder='Nairobi | Kenya'
					   className='userUpdateInput'
					   name='location'
					   onChange={handleChange}
				    />
				</div>
			    </div>

			    <div className='userUpdateRight'>
				<div className='userUpdateUpload'>
				    <img className='userUpdateImg'
					 src={user.profilePic || '/BlankProfile.png'}
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
