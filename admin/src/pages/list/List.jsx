import './lists.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import { Link, useLocation } from 'react-router-dom';

const List = () => {
    const { list } = useLocation();

    return (
	<div className='list'>
	    <div className='listTopSection'>
		<h1 className='listEditTitle'>Manage List</h1>
		<Link to='/newList'>
		    <button className='listCreateButton'>Create list</button>
		</Link>
	    </div>

	    <div className='listContainer'>
		<div className='listDetails'>

		    <div className='listDetailsTop'>
			<img className='profile'
			     src='{movie.thumbnailSmall}'
			     alt='List Thumbnail'
			/>
			<div className='listInfos'>
			    <div className='listName'>{ 'list.title' }</div>
			    <div className='listCategory'>{ 'list.category' }</div>
			</div>
		    </div>

		    <div className='listDetailsBottom'>
			<span className='listDetailsTitle'>List details</span>
			<div className='listDetailsDiv'>
			    <CalendarMonthOutlinedIcon className='listDetailsIcon' />
			    <div className='listDetailsContent'>{ 'list.date' }</div>
			</div>
			<div className='listDetailsDiv'>
			    <PermIdentityIcon className='listDetailsIcon' />
			    <div className='listDetailsContent'>{ 'list.isDrone' }</div>
			</div>
			<div className='listDetailsDiv'>
			    <SportsSoccerIcon className='listDetailsIcon' />
			    <div className='listDetailsContent'>{ 'list.desc' }</div>
			</div>
		    </div>
		</div>

		<div className='listUpdate'>
		    <div className='listUpdateTitle'>Edit</div>
		    <form className='listUpdateForm'>
			<div className='listUpdateTop'>
			    <div className='listUpdateItem'>
				<label>List Title</label>
				<input type='text'
				       placeholder={'list.title'}
				       className='listUpdateInput'
				/>
			    </div>
			    <div className='listUpdateItem'>
				<label>Category</label>
				<input type='text'
				       placeholder={'list.category'}
				       className='listUpdateInput'
				/>
			    </div>
			    <div className='listUpdateItem'>
				<label>Drone Footage</label>
				<input type='text'
				       placeholder={'list.isDrone'}
				       className='listUpdateInput'
				/>
			    </div>
			    <div className='listUpdateItem'>
				<label>Location</label>
				<input type='text'
				       placeholder='Nairobi | Kenya'
				       className='listUpdateInput'
				/>
			    </div>
			    <div className='listUpdateItem'>
				<label>Description</label>
				<input type='text'
				       placeholder={'list.desc'}
				       className='listUpdateInput'
				/>
			    </div>
			    <div className='listUpdateItem'>
				<label>Trailer</label>
				<input type='file'
				       placeholder={'list.trailer'}
				       className='listUpdateInput'
				/>
			    </div>
			    <div className='listUpdateItem'>
				<label>List</label>
				<input type='file'
				       placeholder={'list.list'}
				       className='listUpdateInput'
				/>
			    </div>
			</div>

			<div className='listUpdateBottom'>
			    <div className='listUpdateUpload'>
				<img className='listUpdateImg'
				     src='/logo.png'
				     alt='List Profile'
				/>
				<label htmlFor='file'>
				    <PublishIcon className='listUpdateIcon' />
				</label>
				<input id='file' type='file'
				       style={{ display: 'none' }}/>
			    </div>
			    <button className='listUpdateButton'>Update</button>
			</div>
		    </form>
		</div>
	    </div>
	</div>
    );
};

export default List;
