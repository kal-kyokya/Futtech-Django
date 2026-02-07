import './home.scss';
import Navbar from '../../components/Navbar';
import Featured from '../../components/featured/Featured';
import Playlist from '../../components/playlist/Playlist';
import { useState, useEffect, useContext } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import apiClient from '../../services/apiClient';

const Home = ({ category }) => {
    const [playlists, setPlaylists] = useState([]);
    const [subCategory, setSubCategory] = useState('');
    const { videos } = useContext(VideoContext);

    useEffect(() => {
	let isMounted = true;

	const fetchPlaylists = async () => {
	    const params = new URLSearchParams();

	    if (category) {
		params.append('category', category);
	    }

	    if (subCategory) {
		params.append('subCategory', subCategory);
	    }

	    const endpoint = params.toString() ? `/playlists?${params.toString()}` : '/playlists';

	    try {
		const response = await apiClient.get(endpoint);
		if (isMounted) {
		    setPlaylists(response.data || [])
		}
	    } catch (error) {
		console.error('Failed to fetch playlists: ', error);
		if (isMounted) {
		    setPlaylists([]);
		}
	    }
	};

	fetchPlaylists();

	return () => {
	    isMounted = false;
	};
    }, [category, subCategory]);

    const hasPlaylists = Array.isArray(playlists) && playlists.length > 0;
    const hasVideos = Array.isArray(videos) && videos.length > 0;

    return (
	<div className='home'>
	    <Navbar />
	    <Featured category={ category } />

	    {hasPlaylists
	     ? playlists.map((playlist) => {
		 <Playlist key={playlist._id || playlist.title} playlist={ playlist } />
	     })
	     : hasVideos && (
		 <Playlist
		     playlist={{
			 'title': 'Recommendations',
			 'content': videos.slice(-10).map(video => video._id)
		     }}
		 />
	     )}
	</div>
    );
};

export default Home;
