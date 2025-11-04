import './home.scss';
import Navbar from '../../components/Navbar';
import Featured from '../../components/featured/Featured';
import List from '../../components/list/List';
import { useState, useEffect, useContext } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import apiClient from '../../services/apiClient';

const Home = ({ category }) => {
    const [lists, setLists] = useState([]);
    const [subCategory, setSubCategory] = useState('');
    const { videos } = useContext(VideoContext);

    useEffect(() => {
	let isMounted = true;

	const fetchLists = async () => {
	    const params = new URLSearchParams();

	    if (category) {
		params.append('category', category);
	    }

	    if (subCategory) {
		params.append('subCategory', subCategory);
	    }

	    const endpoint = params.toString() ? `/lists?${params.toString()}` : '/lists';

	    try {
		const response = await apiClient.get(endpoint);
		if (isMounted) {
		    setLists(response.data || [])
		}
	    } catch (error) {
		console.error('Failed to fetch lists:', error);
		if (isMounted) {
		    setLists([]);
		}
	    }
	};

	fetchLists();

	return () => {
	    isMounted = false;
	};
    }, [category, subCategory]);

    return (
	<div className='home'>
	    <Navbar />
	    <Featured category={ category } />

	    {
		Array.isArray(lists) && lists.length ? lists.map((list) => {
		    <List list={ list }/>
		})
		    : Array.isArray(videos) && videos.length && <List list={{
				'title': 'Recommendations',
				'content': videos.slice(-10).map(video => video._id)
			    }}
		      />
	    }
	</div>
    );
}

export default Home;
