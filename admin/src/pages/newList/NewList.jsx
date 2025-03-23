import './newList.scss';
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListContext } from '../../contexts/listContext/ListContext';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import { getVideos } from '../../contexts/videoContext/apiCalls';
import { createList } from '../../contexts/listContext/apiCalls';

const NewList = () => {
    const [list, setList] = useState(null);
    const navigate = useNavigate();

    const { dispatch } = useContext(ListContext);
    const { videos, dispatch: dispatchVideo } = useContext(VideoContext);

    useEffect(() => {
	getVideos(dispatchVideo);
    }, [dispatchVideo]);

    const handleChange = (e) => {
	setList({ ...list, [e.target.name]: e.target.value});
    };

    const handleSelect = (e) => {
	let listItems = Array.from(e.target.selectOptions, (item) => item.value);

	setList({ ...list, [e.target.name]: listItems });
    };

    const handleSubmit = (e) => {
	e.preventDefault();

	createList(list, dispatch);
	navigate('/lists');
    };

    return (
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
				{videos.map((video, index) => (
				    <option key="index" value="video._id">
					{video.title}
				    </option>
				))}
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
    );
};

export default NewList;
