import { Component } from 'react';
import './routeError.scss';

// Declarative routes need a React boundary for render and lazy import failures.
export default class RouteError extends Component {
    state = { failed: false };
    static getDerivedStateFromError() {
	return { failed: true };
    }
    render() {
	if (!this.state.failed) return this.props.children;
	return (
	    <main className='routeError' role='alert'>
		<div className='routeError__card'>
		    <p className='eyebrow'>LET’S GET YOU BACK ON TRACK</p>
		    <h1>Something went wrong</h1>
		    <p>We couldn’t load this page. Please return home and try again.</p>
		    <a href='/' className='routeError__link button button--primary'>
			Return home
		    </a>
		</div>
	    </main>
	);
    }
}
