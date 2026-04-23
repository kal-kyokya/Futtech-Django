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
		className='link'
	    >
		Showcase
	    </Link>
	    <Link
		to='/register'
		className='link'
	    >
		Register
	    </Link>
	    <Link
		to='/login'
		className='link'
	    >
		Sign in
	    </Link>
	</nav>
    </header>
);

export default PublicHeader;
