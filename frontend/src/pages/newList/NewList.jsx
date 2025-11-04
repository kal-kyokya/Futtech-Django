import './newList.scss';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListContext } from '../../contexts/listContext/ListContext';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import {
    createListStart, createListSuccess, createListFailure,
} from '../../contexts/listContext/ListActions';
import Navbar from '../../components/Navbar';
import apiClient from '../../services/apiClient';

const NewList = () => {
    const [list, setList] = useState({
	title: '', category: '',
	subCategory; '', thumbnail: null,
	content: [],
    });
    const navigate = useNavigate();

    const { dispatch } = useContext(ListContext);
    const { videos } = useContext(VideoContext);

    const handleChange = (e) => {
	const { name, value, files } = e.target;
	const fieldValue = name === 'thumbnail' && files ? files[0] : value;

	setList((prev) => ({
	    ...prev,
	    [name]: fieldValue,
	}));
    };

    const handleSelect = (e) => {
	const selectedValues = Array.from(
	    e.target.selectedOptions,
	    (option) => option.value,
	);

	setList((prev) => ({
	    ...prev,
	    [e.target.name]: selectedValues,
	}));
    };

    const handleSubmit = async (e) => {
	e.preventDefault();
	dispatch(createListStart());

	try {
	    const payload = {
		title: list.title,
		category: list.category,
		subCategory: list.subCategory,
		content: list.content
	    };

	    const response = await apiClient.post('/lists/', payload);

	    dispatch(createListSuccess(response.data));
	    navigate('/lists');
	} catch (error) {
	    console.error('Failed to create list: ', error);
	    dispatch(createListFailure());
	}
    };

    return (
	<>
	    <Navbar />

	    <div className='newList'>
		<h1 className='newListTitle'>New List</h1>

		<form className='newListForm'>
		    <div className='newListTop'>
			<div className='newListLeft'>
			    <div className='newListItem'>
				<label>Title</label>
				<input type='text'
				       placeholder={ 'list.title' }
				       className='newListInput'
				       name='title'
				       onChange={handleChange}
				/>
			    </div>
			    <div className='newListItem'>
				<label>Category</label>
				<input type='text'
				       placeholder={ 'list.category' }
				       className='newListInput'
				       name='category'
				       onChange={handleChange}
				/>
			    </div>
			    <div className='newListItem'>
				<label>Sub-category</label>
				<input type='text'
				       placeholder={ 'list.subCategory' }
				       className='newListInput'
				       name='subCategory'
				       onChange={handleChange}
				/>
			    </div>
			    <div className='newListItem'>
				<label>Thumbnail</label>
				<input type='file'
				       id='thumbnail'
				       name='thumbnail'
				       onChange={handleChange}
				/>
			    </div>
			</div>

			<div className='newListRight'>
			    <div className='newListItem'>
				<label>List Content</label>
				<select className='newListSelect'
					multiple
					name='content'
					onChange={handleSelect}
					style={ { height: '260px' } }
				>
				    {
					Array.isArray(videos) &&
					    videos.length &&
					    videos.map((video, index) => (
						<option key="index" value="video._id">
						    {video.title}
						</option>
					    ))
				    }
				</select>
			    </div>
			</div>
		    </div>
		    <div className='newListBottom'>
			<button className='newListButton'
				onClick={handleSubmit}
			>
			    Create
			</button>
		    </div>
		</form>

	    </div>
	</>
    );
};

export default NewList;
