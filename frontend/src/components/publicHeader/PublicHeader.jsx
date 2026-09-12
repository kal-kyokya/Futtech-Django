import './publicHeader.scss';
import { Link } from 'react-router-dom';

const PublicHeader = () => (
    <header className='publicHeader'>
	<Link
	    to='/showcase'
	    className='publicHeader__brand link'
	>
	    <img
		src='/logo.png'
		alt='Futtech logo'
	    />
	    <span>Futtech Explore</span>
	</Link>

	<nav className='publicHeader__nav'>
	    <Link
		to='/showcase'
		className='button button--secondary'
	    >
		<span>Showcase</span>
	    </Link>
	    <Link
		to='/futtech-xi'
		className='button button--secondary'
	    >
		<span>Futtech XI</span>
	    </Link>
	    <Link
		to='/home'
		className='button button--secondary'
	    >
		<span>Home</span>
	    </Link>
	</nav>
    </header>
);

export default PublicHeader;
