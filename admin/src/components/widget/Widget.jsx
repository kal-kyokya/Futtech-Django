import './widget.scss';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const Widget = () => {
    return (
	<div className='widget'>
	    <div className='widgetItems'>
		<span className='widgetTitle'>Users</span>
		<div className='widgetData'>
		    <span className='widgetDataFigure'>+39 | </span>
		    <span className='widgetDataPercent'>52%<ArrowUpwardIcon className='widgetIcons' /></span>
		</div>
		<span className='widgetText'>Compared to last month.</span>
	    </div>
	    <div className='widgetItems'>
		<span className='widgetTitle'>Revenue</span>
		<div className='widgetData'>
		    <span className='widgetDataFigure'>+Ksh91,000 | </span>
		    <span className='widgetDataPercent'>78%<ArrowUpwardIcon className='widgetIcons' /></span>
		</div>
		<span className='widgetText'>Compared to last month.</span>
	    </div>
	    <div className='widgetItems'>
		<span className='widgetTitle'>Uploads</span>
		<div className='widgetData'>
		    <span className='widgetDataFigure'>+13 | </span>
		    <span className='widgetDataPercent'>26%<ArrowDownwardIcon className='widgetIcons negative' /></span>
		</div>
		<span className='widgetText'>Compared to last month.</span>
	    </div>
	</div>
    );
}

export default Widget;
