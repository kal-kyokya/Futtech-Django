import './list.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import { Link, useLocation } from 'react-router-dom';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import { useState } from 'react';
import { ListContext } from '../../contexts/listContext/ListContext';
import { updateList } from '../../contexts/listContext/apiCalls';

const List = () => {
    const { list } = useLocation();
    const [updatedList, setUpdatedList] = useState(null);
    const { dispatch } = useContext(ListContext);

    const handleChange = (e) => {
	setUpdatedList({ ...updatedList, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
	e.preventDefault();
	setUpdatedList({ ...updatedList, content: list.content });

	updateList(updatedList, dispatch);
    };

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
			     src='{list.thumbnail}'
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
			    <ClassOutlinedIcon className='listDetailsIcon' />
			    <div className='listDetailsContent'>{ 'list.subCategory' }</div>
			</div>
			<div className='listDetailsDiv'>
			    <ListOutlinedIcon className='listDetailsIcon' />
			    <div className='listDetailsContent'>{ 'list.content' }</div>
			</div>
			<div className='listDetailsDiv'>
			    <CalendarMonthOutlinedIcon className='listDetailsIcon' />
			    <div className='listDetailsContent'>{ 'list.date' }</div>
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
				       name='title'
				       onChange={handleChange}
				/>
			    </div>
			    <div className='listUpdateItem'>
				<label>Category</label>
				<input type='text'
				       placeholder={'list.category'}
				       className='listUpdateInput'
				       name='category'
				       onChange={handleChange}
				/>
			    </div>
			    <div className='listUpdateItem'>
				<label>Sub-category</label>
				<input type='text'
				       placeholder={'list.subCategory'}
				       className='listUpdateInput'
				       name='subCategory'
				       onChange={handleChange}
				/>
			    </div>
			</div>

			<div className='listUpdateBottom'>
			    <div className='listUpdateUpload'>
				<img className='listUpdateImg'
				     src='/logo.png'
				     alt='List Profile'
				     name='thumbnail'
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
