import './home.scss';
import Navbar from '../../components/Navbar';
import Featured from '../../components/featured/Featured';
import List from '../../components/list/List';
import Watch from '../../pages/watch/Watch';
import Register from '../../pages/register/Register';
import Login from '../../pages/login/Login';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = ({ category }) => {
    const [lists, setLists] = useState([]);
    const [subCategory, setSubCategory] = useState([]);

    useEffect(() => {
	const getRandomLists = async () => {
	    try {
		const res = await axios.get(
		    `lists${category ? '?category=' + category : ''}${
		    subCategory ? '?subCategory=' + subCategory : ''
		  }`,
		  {
		    headers: { token: '' }
		  }
		);
	    } catch (err) {
		console.log(err);
	    }
	};

	getRandomLists();
    }, [category, subCategory]);

    return (
	<div className='home'>
	    <Navbar />
	    <Featured category={ category } />
	    {lists.map((list) => {
<List />
	    })}
	</div>
    );
}

export default Home;
