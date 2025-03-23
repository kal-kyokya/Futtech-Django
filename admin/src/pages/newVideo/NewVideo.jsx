import './newVideo.scss';
import PublishIcon from '@mui/icons-material/Publish';

const NewVideo = () => {
    return (
	<div className='newVideo'>
	    <h1 className='newVideoTitle'>New Video</h1>

	    <form className='newVideoForm'>
		<div className='newVideoTop'>
		    <div className='newVideoItem'>
			<label>Title</label>
			<input type='text'
			       placeholder={ 'video.title' }
			       className='newVideoInput'
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Description</label>
			<input type='text'
			       placeholder={ 'video.desc' }
			       className='newVideoInput'
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Location</label>
			<input type='text'
			       placeholder={ 'video.location' }
			       className='newVideoInput'
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Category</label>
			<input type='text'
			       placeholder={ 'video.category' }
			       className='newVideoInput'
			       autoComplete='new-password'
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Date</label>
			<input type='text'
			       placeholder={ 'video.date' }
			       className='newVideoInput'
			/>
		    </div>
		    <div className='newVideoItem'>
			<label>Drone Footage?</label>
			<select className='newVideoSelect'>
			    <option>Select</option>
			    <option value='true'>Yes</option>
			    <option value='false'>No</option>
			</select>
		    </div>
		    <div className='newVideoItem'>
			<label>AI Analysis?</label>
			<select className='newVideoSelect'>
			    <option>Select</option>
			    <option value='true'>Yes</option>
			    <option value='false'>No</option>
			</select>
		    </div>
		    <div className='newVideoItem'>
			<label>Video</label>
			<input type='file' id='video' />
		    </div>
		    <div className='newVideoItem'>
			<label>Trailer</label>
			<input type='file' id='trailer' />
		    </div>
		    <div className='newVideoItem'>
			<label>Main Thumbnail</label>
			<input type='file' id='thumbnail' />
		    </div>
		    <div className='newVideoItem'>
			<label>Smaller Thumbnail</label>
			<input type='file' id='thumbnailSmall' />
		    </div>
		</div>
		<div className='newVideoBottom'>
		    <button className='newVideoButton'>Create</button>
		</div>
	    </form>

	</div>
    );
};

export default NewVideo;
