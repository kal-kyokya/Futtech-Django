import './playlist.scss';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import { Link, useLocation } from 'react-router-dom';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import { useState, useContext } from 'react';
import { PlaylistContext } from '../../contexts/playlistContext/PlaylistContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import axios from 'axios';

const Playlist = () => {
    const { playlist } = useLocation();
    const [updatedPlaylist, setUpdatedPlaylist] = useState(null);
    const { dispatch } = useContext(PlaylistContext);
    const { user } = useContext(UserContext);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => {
	setUpdatedPlaylist({ ...updatedPlaylist, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
	e.preventDefault();
	setUpdatedPlaylist({ ...updatedPlaylist, content: playlist.content });
	dispatch(updatePlaylistStart());

	try {
	    const res = await axios.put(`${baseURL}/playlists/` + playlist._id, playlist, {
		headers: {
		    'auth-token': user.accessToken
		}
	    });

	    dispatch(updatePlaylistSuccess(res.data));
	} catch (err) {
	    console.error(err);
	    dispatch(updatePlaylistFailure());
	}
    };

    return (
	<div className='playlist'>
	    <div className='playlistTopSection'>
		<h1 className='playlistEditTitle'>Manage Playlist</h1>
		<Link to='/newPlaylist'>
		    <button className='playlistCreateButton'>Create playlist</button>
		</Link>
	    </div>

	    <div className='playlistContainer'>
		<div className='playlistDetails'>

		    <div className='playlistDetailsTop'>
			<img className='profile'
			     src='{playlist.thumbnail}'
			     alt='Playlist Thumbnail'
			/>
			<div className='playlistInfos'>
			    <div className='playlistName'>{ 'playlist.title' }</div>
			    <div className='playlistCategory'>{ 'playlist.category' }</div>
			</div>
		    </div>

		    <div className='playlistDetailsBottom'>
			<span className='playlistDetailsTitle'>Playlist details</span>
			<div className='playlistDetailsDiv'>
			    <ClassOutlinedIcon className='playlistDetailsIcon' />
			    <div className='playlistDetailsContent'>{ 'playlist.subCategory' }</div>
			</div>
			<div className='playlistDetailsDiv'>
			    <ListOutlinedIcon className='playlistDetailsIcon' />
			    <div className='playlistDetailsContent'>{ 'playlist.content' }</div>
			</div>
			<div className='playlistDetailsDiv'>
			    <CalendarMonthOutlinedIcon className='playlistDetailsIcon' />
			    <div className='playlistDetailsContent'>{ 'playlist.date' }</div>
			</div>
		    </div>
		</div>

		<div className='playlistUpdate'>
		    <div className='playlistUpdateTitle'>Edit</div>
		    <form className='playlistUpdateForm'>
			<div className='playlistUpdateTop'>
			    <div className='playlistUpdateItem'>
				<label>Playlist Title</label>
				<input type='text'
				       placeholder={'playlist.title'}
				       className='playlistUpdateInput'
				       name='title'
				       onChange={handleChange}
				/>
			    </div>
			    <div className='playlistUpdateItem'>
				<label>Category</label>
				<input type='text'
				       placeholder={'playlist.category'}
				       className='playlistUpdateInput'
				       name='category'
				       onChange={handleChange}
				/>
			    </div>
			    <div className='playlistUpdateItem'>
				<label>Sub-category</label>
				<input type='text'
				       placeholder={'playlist.subCategory'}
				       className='playlistUpdateInput'
				       name='subCategory'
				       onChange={handleChange}
				/>
			    </div>
			</div>

			<div className='playlistUpdateBottom'>
			    <div className='playlistUpdateUpload'>
				<img className='playlistUpdateImg'
				     src='/logo.png'
				     alt='Playlist Profile'
				     name='thumbnail'
				/>
				<label htmlFor='file'>
				    <PublishIcon className='playlistUpdateIcon' />
				</label>
				<input id='file' type='file'
				       style={{ display: 'none' }}/>
			    </div>
			    <button className='playlistUpdateButton'>Update</button>
			</div>
		    </form>
		</div>
	    </div>
	</div>
    );
};

export default Playlist;
