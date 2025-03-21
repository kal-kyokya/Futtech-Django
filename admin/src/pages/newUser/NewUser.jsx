import './newUser.scss';
import PublishIcon from '@mui/icons-material/Publish';

const NewUser = () => {
    return (
	<div className='newUser'>
	    <h1 className='newUserTitle'>New User</h1>

	    <form className='newUserForm'>
		<div className='newUserLeft'>
		    <div className='newUserItem'>
			<label>First Name</label>
			<input type='text'
			       placeholder='Jean-Paul'
			       className='newUserInput'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Last Name</label>
			<input type='text'
			       placeholder='KYOKYA'
			       className='newUserInput'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Email</label>
			<input type='email'
			       placeholder='kalkyokya4@gmail.com'
			       className='newUserInput'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Username</label>
			<input type='text'
			       placeholder='kal-kyokya'
			       className='newUserInput'
			       autoComplete='new-password'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Password</label>
			<input type='password'
			       placeholder='Enter Password'
			       className='newUserInput'
			       autoComplete='new-password'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Confirm Password</label>
			<input type='password'
			       placeholder='Re-enter Password'
			       className='newUserInput'
			       autoComplete='new-password'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Position</label>
			<input type='text'
			       placeholder='Striker'
			       className='newUserInput'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Football Career</label>
			<select className='newUserSelect'>
			    <option>Select</option>
			    <option value='active'>active</option>
			    <option value='retired'>Retired</option>
			</select>
		    </div>
		    <div className='newUserItem'>
			<label>Profession</label>
			<input type='text'
			       placeholder='Software Engineer'
			       className='newUserInput'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Phone</label>
			<input type='text'
			       placeholder='+254798129095'
			       className='newUserInput'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Location</label>
			<input type='text'
			       placeholder='Nairobi | Kenya'
			       className='newUserInput'
			/>
		    </div>
		    <div className='newUserItem'>
			<label>Sex</label>
			<div className='newUserSex'>
			    <input type='radio' name='male' value='male' />
			    <label htmlFor='male'>Male</label>
			    <input type='radio' name='female' value='female' />
			    <label htmlFor='female'>Female</label>
			    <input type='radio' name='pass' value='pass' />
			    <label htmlFor='pass'>Pass</label>
			</div>
		    </div>
		    <button className='newUserButton'>Create</button>
		</div>

		<div className='newUserRight'>
		    <div className='newUserUpload'>
			<img className='newUserImg'
			     src='https://raw.githubusercontent.com/kal-kyokya/react-admin-panel/757001cfffa81dc9957e7dde0eea61417824d9d7/public/logo.png'
			     alt='User Profile'
			/>
			<label htmlFor='file'>
			    <PublishIcon className='newUserIcon' />
			</label>
			<input id='file' type='file'
			       style={{ display: 'none' }}/>
		    </div>
		</div>
	    </form>

	</div>
    );
};

export default NewUser;
