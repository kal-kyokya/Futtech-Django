import './home.scss';
import Navbar from '../../components/Navbar';
import Featured from '../../components/featured/Featured';
import List from '../../components/list/List';
import Watch from '../../pages/watch/Watch';
import Register from '../../pages/register/Register';
import Login from '../../pages/login/Login';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/authContext/AuthContext';

const Home = ({ category }) => {
    const [lists, setLists] = useState([]);
    const [subCategory, setSubCategory] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
	const getRandomLists = async () => {
	    const res = await axios.get(
		`lists${category ? '?category=' + category : ''}${
		    subCategory ? '?subCategory=' + subCategory : ''
		  }`,
		{
		    headers: { 'auth-token': user.accessToken }
		}
	    ).then((res) => {
		setLists(res.data());
	    }).catch((err) => {
		console.log(err);
	    });
	}

	getRandomLists();
    }, [category, subCategory]);

    return (
	<div className='home'>
	    <Navbar />
	    <Featured category={ category } />
	    {lists.map((list) => {
		<List list={ list }/>
	    })}
	</div>
    );
}

export default Home;
