import './chart.scss';
import { LineChart, Line,
	 XAxis, Legend,
	 CartesianGrid, Tooltip,
	 ResponsiveContainer
       } from 'recharts';

const Chart = ({ title, data, grid, dataKey, lineKey1, lineKey2 }) => {
    return (
	<div className='chart'>
	    <h3 className='chartTitle'>{ title }</h3>
	    <ResponsiveContainer width='100%' aspect={5 / 2}>
		<LineChart data={data} margin={
			       {
				   top: 5, right: 30,
				   left: 20, bottom: 5,
			       }
			   }
		>
		    { grid && <CartesianGrid strokeDasharray='3 3' />}
		    <XAxis dataKey={ dataKey } />
		    <Tooltip />
		    <Legend />
		    <Line type='monotone' dataKey={ lineKey1 }
		    stroke='#05F283' activeDot={{ r: 8 }} />
		    <Line type='monotone' dataKey={ lineKey2 }
		    stroke='#028ECA'/>
		</LineChart>
	    </ResponsiveContainer>	    
	</div>
    );
}

export default Chart;
