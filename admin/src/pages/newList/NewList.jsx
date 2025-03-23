import './newList.scss';
import PublishIcon from '@mui/icons-material/Publish';

const NewList = () => {
    return (
	<div className='newList'>
	    <h1 className='newListTitle'>New List</h1>

	    <form className='newListForm'>
		<div className='newListTop'>
		    <div className='newListItem'>
			<label>Title</label>
			<input type='text'
			       placeholder={ 'list.title' }
			       className='newListInput'
			/>
		    </div>
		    <div className='newListItem'>
			<label>Description</label>
			<input type='text'
			       placeholder={ 'list.desc' }
			       className='newListInput'
			/>
		    </div>
		    <div className='newListItem'>
			<label>Location</label>
			<input type='text'
			       placeholder={ 'list.location' }
			       className='newListInput'
			/>
		    </div>
		    <div className='newListItem'>
			<label>Category</label>
			<input type='text'
			       placeholder={ 'list.category' }
			       className='newListInput'
			       autoComplete='new-password'
			/>
		    </div>
		    <div className='newListItem'>
			<label>Date</label>
			<input type='text'
			       placeholder={ 'list.date' }
			       className='newListInput'
			/>
		    </div>
		    <div className='newListItem'>
			<label>Drone Footage?</label>
			<select className='newListSelect'>
			    <option>Select</option>
			    <option value='true'>Yes</option>
			    <option value='false'>No</option>
			</select>
		    </div>
		    <div className='newListItem'>
			<label>AI Analysis?</label>
			<select className='newListSelect'>
			    <option>Select</option>
			    <option value='true'>Yes</option>
			    <option value='false'>No</option>
			</select>
		    </div>
		    <div className='newListItem'>
			<label>List</label>
			<input type='file' id='list' />
		    </div>
		    <div className='newListItem'>
			<label>Trailer</label>
			<input type='file' id='trailer' />
		    </div>
		    <div className='newListItem'>
			<label>Main Thumbnail</label>
			<input type='file' id='thumbnail' />
		    </div>
		    <div className='newListItem'>
			<label>Smaller Thumbnail</label>
			<input type='file' id='thumbnailSmall' />
		    </div>
		</div>
		<div className='newListBottom'>
		    <button className='newListButton'>Create</button>
		</div>
	    </form>

	</div>
    );
};

export default NewList;
