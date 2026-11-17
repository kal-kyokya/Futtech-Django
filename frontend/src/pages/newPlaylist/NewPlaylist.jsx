import './newPlaylist.scss';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistContext } from '../../contexts/playlistContext/PlaylistContext';
import {
    createPlaylistStart,
    createPlaylistSuccess,
    createPlaylistFailure,
} from '../../contexts/playlistContext/PlaylistActions';
import Navbar from '../../components/Navbar';
import apiClient, { normalizeError } from '../../services/apiClient';
import contentService from '../../services/contentService';

export default function NewPlaylist() {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { dispatch, isFetching } = useContext(PlaylistContext);
    const navigate = useNavigate();
    const submit = async (event) => {
	event.preventDefault();
	if (isFetching) return;
	dispatch(createPlaylistStart());
	setError('');
	try {
	    const { data } = await apiClient.post('/playlists/', { name });
	    contentService.clearCache();
	    dispatch(createPlaylistSuccess(data));
	    navigate('/playlists');
	} catch (failure) {
	    const normalized = normalizeError(failure);
	    setError(normalized.fields?.name || normalized.message);
	    dispatch(createPlaylistFailure());
	}
    };
    return (
	<>
	    <Navbar />
	    <main
		id='main-content'
		tabIndex={-1}
		className='newPlaylist page-container'
	    >
		<p className='eyebrow'>ORGANIZE YOUR FOOTAGE</p>
		<h1>New playlist</h1>
		<p>
		    Give your collection a name. Your new playlist starts empty and
		    private.
		</p>
		<form
		    className='card newPlaylistForm'
		    onSubmit={submit}
		    aria-busy={isFetching}
		>
		    <label htmlFor='playlist-name'>Playlist name</label>
		    <input
			id='playlist-name'
			name='name'
			value={name}
			onChange={(event) => setName(event.target.value)}
			placeholder='For example, First touch drills'
			maxLength={255}
			required
			aria-invalid={Boolean(error)}
			aria-describedby={error ? 'playlist-error' : undefined}
		    />
		    {error && (
			<p id='playlist-error' role='alert'>
			    {error}
			</p>
		    )}
		    <button type='submit' disabled={isFetching}>
			{isFetching ? 'Creating…' : 'Create playlist'}
		    </button>
		</form>
	    </main>
	</>
    );
}
