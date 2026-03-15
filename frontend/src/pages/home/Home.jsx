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
import { useBranding } from '../contexts/BrandingContext.tsx';


const Home = ({ category }) => {
    const { videos } = useContext(VideoContext);
    const { playlists, dispatch, isFetching } = useContext(PlaylistContext);
    const { brand } = useBranding();

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

    const normalizedPlaylists = useMemo(() => {
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
	content: videos.slice(-10).map(getVideoId).filter(Boolean),
    };

    return (
	<div className='home'>
	    <Navbar />
	    <Featured category={ category } />
	    <header className='landing-branding'>
		<img src={brand.logo || '/logo.png'} alt={`${brand.name} logo`} />
		<div>
		    <h1>{brand.name}</h1>
		    <p>{brand.description || 'Football intelligence for modern coaching.'}</p>
		</div>
	    </header>

	    {hasPlaylists
	     ? normalizedPlaylists.map(({ key, playlist }) => (
		 <Playlist key={key} playlist={ playlist } />
	     ))
	     : hasVideos && (
		 <Playlist playlist={ fallbackPlaylist } />
	     )}
	    <footer className='tenant-footer'>
		<span>{brand.name}</span>
		<span style={{ color: brand.primary_color }}>Powered by Futtech</span>
	    </footer>
	</div>
    );
};

export default Home;
