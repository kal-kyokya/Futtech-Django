import './home.scss';
import Navbar from '../../components/Navbar';
import Featured from '../../components/featured/Featured';
import List from '../../components/list/List';
import Watch from '../../pages/watch/Watch';
import Register from '../../pages/register/Register';
import Login from '../../pages/login/Login';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../contexts/userContext/UserContext';
import { VideoContext } from '../../contexts/videoContext/VideoContext';

const Home = ({ category }) => {
    const [lists, setLists] = useState([]);
    const [subCategory, setSubCategory] = useState('');
    const { user } = useContext(UserContext);
    const { videos } = useContext(VideoContext);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
	const getRandomLists = async () => {
	    await axios.get(
		`${baseURL}/lists${category ? '?category=' + category : ''}${
		    subCategory ? '?subCategory=' + subCategory : ''
		  }`,
		{
		    headers: { 'auth-token': user.accessToken }
		}
	    ).then((res) => {
		setLists(res.data);
	    }).catch((err) => {
		console.error(err);
	    });
	}

	getRandomLists();
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
