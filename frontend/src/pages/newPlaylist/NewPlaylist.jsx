import './newPlaylist.scss';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistContext } from '../../contexts/playlistContext/PlaylistContext';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import {
    createPlaylistStart, createPlaylistSuccess, createPlaylistFailure,
} from '../../contexts/playlistContext/PlaylistActions';
import Navbar from '../../components/Navbar';
import apiClient from '../../services/apiClient';

const NewPlaylist = () => {
    const [playlist, setPlaylist] = useState({
	title: '', category: '',
	subCategory: '', thumbnail: null,
	content: [],
    });
    const navigate = useNavigate();

    const { dispatch } = useContext(PlaylistContext);
    const { videos } = useContext(VideoContext);

    const handleChange = (e) => {
	const { name, value, files } = e.target;
	const fieldValue = name === 'thumbnail' && files ? files[0] : value;

	setPlaylist((prev) => ({
	    ...prev,
	    [name]: fieldValue,
	}));
    };

    const handleSelect = (e) => {
	const selectedValues = Array.from(
	    e.target.selectedOptions,
	    (option) => option.value,
	);

	setPlaylist((prev) => ({
	    ...prev,
	    [e.target.name]: selectedValues,
	}));
    };

    const handleSubmit = async (e) => {
	e.preventDefault();
	dispatch(createPlaylistStart());

	try {
	    const payload = {
		title: playlist.title,
		category: playlist.category,
		subCategory: playlist.subCategory,
		content: playlist.content
	    };

	    const response = await apiClient.post('/playlists/', payload);

	    dispatch(createPlaylistSuccess(response.data));
	    navigate('/playlists');
	} catch (error) {
	    console.error('Failed to create playlist: ', error);
	    dispatch(createPlaylistFailure());
	}
    };

    return (
	<>
	    <Navbar />

	    <div className='newPlaylist'>
		<h1 className='newPlaylistTitle'>New Playlist</h1>

		<form className='newPlaylistForm' onSubmit={handleSubmit}>
		    <div className='newPlaylistTop'>
			<div className='newPlaylistLeft'>
			    <div className='newPlaylistItem'>
				<label>Title</label>
				<input type='text'
				       placeholder='Playlist title'
				       className='newPlaylistInput'
				       name='title'
				       value={playlist.title}
				       onChange={handleChange}
				       required
				/>
			    </div>
			    <div className='newPlaylistItem'>
				<label>Category</label>
				<input type='text'
				       placeholder='Category'
				       className='newPlaylistInput'
				       name='category'
				       value={playlist.category}
				       onChange={handleChange}
				/>
			    </div>
			    <div className='newPlaylistItem'>
				<label>Sub-category</label>
				<input type='text'
				       placeholder='Sub-category'
				       className='newPlaylistInput'
				       name='subCategory'
				       value={playlist.subCategory}
				       onChange={handleChange}
				/>
			    </div>
			    <div className='newPlaylistItem'>
				<label>Thumbnail</label>
				<input type='file'
				       id='thumbnail'
				       name='thumbnail'
				       accept='image/*'
				       onChange={handleChange}
				/>
			    </div>
			</div>

			<div className='newPlaylistRight'>
			    <div className='newPlaylistItem'>
				<label>Playlist Content</label>
				<select className='newPlaylistSelect'
					multiple
					name='content'
					value={playlist.content}
					onChange={handleSelect}
					style={ { height: '260px' } }
				>
				    {
					Array.isArray(videos) &&
					    videos.length > 0 &&
					    videos.map((video) => (
						<option key={video._id}
							value={video.id}
						>
						    {video.title}
						</option>
					    ))
				    }
				</select>
			    </div>
			</div>
		    </div>

		    <div className='newPlaylistBottom'>
			<button className='newPlaylistButton'
				type='submit'
			>
			    Create
			</button>
		    </div>
		</form>
	    </div>
	</>
    );
};

export default NewPlaylist;
