import './home.scss';
import Navbar from '../../components/Navbar';
import Featured from '../../components/featured/Featured';
import Playlist from '../../components/playlist/Playlist';
import { useMemo, useEffect, useContext } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import { PlaylistContext } from '../../contexts/playlistContext/PlaylistContext';
import {
    getPlaylistsStart,
    getPlaylistsSuccess,
    getPlaylistsFailure
} from '../../contexts/playlistContext/PlaylistActions';
import contentService from '../../services/contentService';

const Home = ({ category }) => {
    const { videos } = useContext(VideoContext);
    const { playlists, dispatch, isFetching } = useContext(PlaylistContext);

    useEffect(() => {
	let isMounted = true;
	const playlistCount = Array.isArray(playlists) ? playlists.length : 0;

	const fetchPlaylists = async () => {
	    if (isFetching || playlistCount > 0) {
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
		    dispatch(getPlaylistsFailure())
		}
	    }
	};

	fetchPlaylists();

	return () => {
	    isMounted = false;
	};
    }, [dispatch, isFetching, playlists]);

    const getVideoId = (video) => video?.id ?? video?._id;

    const normalizedLists = useMemo(() => {
	if (!Array.isArray(playlists)) {
	    return [];
	}

	return playlists.map((playlist) => {
	    const playlistVideos = Array.isArray(playlist.videos)
		? playlist.videos.map(getVideoId).filter(Boolean)
		: Array.isArray(playlist.content)
		? playlist.content
		: [];

	    return {
		key: playlist.id ?? playlist._id ?? playlist.name ?? playlist.title,
		list: {
		    title: playlist.name ?? playlist.title ?? 'Untitled playlist',
		    content: playlistVideos,
		},
	    };
	});
    }, [playlists]);

    const hasLists = normalizedLists.length > 0;
    const hasVideos = Array.isArray(videos) && videos.length > 0;
    const fallbackList = {
	title: 'Recommendations',
	content: videos.slice(-10).map(getVideoId).filter(Boolean),
    };

    return (
	<div className='home'>
	    <Navbar />
	    <Featured category={ category } />

	    {hasLists
	     ? normalizedLists.map(({ key, list }) => (
		 <Playlist key={key} playlist={ list } />
	     ))
	     : hasVideos && (
		 <Playlist playlist={ fallbackPlaylist } />
	     )}
	</div>
    );
};

export default Home;
