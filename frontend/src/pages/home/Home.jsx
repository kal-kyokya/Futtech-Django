import './home.scss';
import Navbar from '../../components/Navbar';
import Featured from '../../components/featured/Featured';
import Playlist from '../../components/playlist/Playlist';
import { useMemo, useEffect, useContext, useRef } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import { PlaylistContext } from '../../contexts/playlistContext/PlaylistContext';
import {
    getPlaylistsStart,
    getPlaylistsSuccess,
    getPlaylistsFailure,
} from '../../contexts/playlistContext/PlaylistActions';
import contentService from '../../services/contentService';

const Home = ({ category }) => {
    const { videos } = useContext(VideoContext);
    const { playlists, dispatch, isFetching, error } =
	  useContext(PlaylistContext);

    const hadPlaylists = useRef(Array.isArray(playlists) && playlists.length > 0);
    useEffect(() => {
	let isMounted = true;

	const fetchPlaylists = async () => {
	    if (hadPlaylists.current) {
		return;
	    }

	    dispatch(getPlaylistsStart());

	    try {
		const response = await contentService.fetchPlaylists(1, 10);

		if (isMounted) {
		    dispatch(getPlaylistsSuccess(response.playlists));
		}
	    } catch (error) {
		console.error('Failed to fetch playlists: ', error);
		if (isMounted) {
		    dispatch(getPlaylistsFailure());
		}
	    }
	};

	fetchPlaylists();

	return () => {
	    isMounted = false;
	};
    }, [dispatch]);

    const getVideoId = (video) => video?.id ?? video?._id;

    const normalizedPlaylists = useMemo(() => {
	if (!Array.isArray(playlists)) {
	    return [];
	}

	return playlists.map((playlist) => {
	    const playlistVideos = Array.isArray(playlist.videos)
		  ? playlist.videos.filter((video) => getVideoId(video))
		  : Array.isArray(playlist.content)
		  ? playlist.content
		  : [];

	    return {
		key: playlist.id ?? playlist._id ?? playlist.name ?? playlist.title,
		playlist: {
		    title: playlist.name ?? playlist.title ?? 'Untitled playlist',
		    content: playlistVideos,
		},
	    };
	});
    }, [playlists]);

    const hasPlaylists = normalizedPlaylists.length > 0;
    const hasVideos = Array.isArray(videos) && videos.length > 0;
    const fallbackPlaylist = {
	title: 'Recommendations',
	content: (Array.isArray(videos) ? videos : [])
	    .slice(-10)
	    .map(getVideoId)
	    .filter(Boolean),
    };

    return (
	<div className='home'>
	    <Navbar />
	    <main id='main-content' tabIndex={-1} className='homeMain'>
		<Featured category={category} />
		<div className='homeLibrary'>
		    <div className='section-heading'>
			<div>
			    <p className='eyebrow'>KEEP BUILDING YOUR GAME</p>
			    <h2>Your video library</h2>
			</div>
		    </div>
		    {isFetching && (
			<p role='status' className='status-message'>
			    Loading your playlists…
			</p>
		    )}
		    {error && (
			<p role='alert'>
			    We could not load your playlists. Please refresh to try again.
			</p>
		    )}
		    {!isFetching && !error && !hasPlaylists && !hasVideos && (
			<p className='empty-state'>
			    Your library is ready for a fresh perspective. Your playlists and
			    videos will appear here.
			</p>
		    )}

		    {hasPlaylists
		     ? normalizedPlaylists.map(({ key, playlist }) => (
			 <Playlist key={key} playlist={playlist} />
		     ))
		     : hasVideos && <Playlist playlist={fallbackPlaylist} />}
		</div>
	    </main>
	</div>
    );
};

export default Home;
