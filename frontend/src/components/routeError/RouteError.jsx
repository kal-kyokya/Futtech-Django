import './routeError.scss';
import { Link, useRouteError } from 'react-router-dom';

const RouteError = () => (
    const error = useRouteError();
    const message = error?.statusText || error?.message || 'Unexpected error.';

    return (
	<div className='routeError'>
	    <div className='routeError__card'>
		<h1>
		    Something went wrong
		</h1>
		<p>
		    {message}
		</p>
		<Link to='/'
		      className='routeError__link'
		>
		    Let's go Home — Home page
		</Link>
	    </div>
	</div>
    );
);

export default RouteError;
