import './insights.scss';
import Chart from '../../components/chart/Chart';
import { data } from '../../dummyData';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const Insights = () => {
    const MONTHS = useMemo(
	() => [
	    'Jan', 'Feb', 'Mar',
	    'Apr', 'May', 'Jun',
	    'Jul', 'Aug', 'Sep',
	    'Oct', 'Nov', 'Dec'
	],
	[]
    );

    const [userStats, setUserStats] = useState([]);

    useEffect(() => {
	const getStats = async () => {
	    try {
		const res = await axios.get('/users/stats', {
		    headers: {
			token: ''
		    }
		});
		res.data.map((month) =>
		    setUserStats((prev) => [
			...prev,
			{ 'month': MONTHS[month._id - 1], 'New Users': month.total }
		    ])
		);
	    } catch (err) {
		console.log(err);
	    }
	};

	getStats();
    }, [MONTHS]);

    return (
	<div className='insights'>
	    <Chart title='Monthly User Registration'
		   data={ userStats }
		   grid
		   dataKey='month'
		   lineKey1='New Users'
	    />
	</div>
    );
}

export default Insights;
