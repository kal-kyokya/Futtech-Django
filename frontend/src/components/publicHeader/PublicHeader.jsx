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
	    <span>Futtech Showcase</span>
	</Link>

	<nav className='publicHeader__nav'>
	    <Link
		to='/showcase'
		className='button button--secondary'
	    >
		<span>Showcase</span>
	    </Link>
	    <Link
		to='/register'
		className='button button--secondary'
	    >
		<span>Register</span>
	    </Link>
	</nav>
    </header>
);

export default PublicHeader;
