import './home.scss';
import Widget from '../../components/widget/Widget';
import WidgetSmall from '../../components/widgetSmall/WidgetSmall';
import WidgetLarge from '../../components/widgetLarge/WidgetLarge';

const Home = () => {
    return (
	<div className='home'>
	    <Widget />
	    <div className='widgets'>
		<WidgetSmall />
		<WidgetLarge />
	    </div>
	</div>
    );
}

export default Home;
