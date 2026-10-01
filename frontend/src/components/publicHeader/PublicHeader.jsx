import './publicHeader.scss';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const PublicHeader = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
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

	    <button
		type='button'
		className={`publicHeader__menuToggle ${isMobileMenuOpen ? 'active' : ''}`}
		aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
		aria-expanded={isMobileMenuOpen}
		aria-controls='public-header-navigation'
		onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
	    >
		<span />
		<span />
		<span />
	    </button>

	    <nav
		id='public-header-navigation'
		className={`publicHeader__nav ${isMobileMenuOpen ? 'active' : ''}`}
	    >
		<Link
		    to='/showcase'
		    className='button button--secondary'
		    onClick={closeMobileMenu}
		>
		    <span>Showcase</span>
		</Link>
		<Link
		    to='/futtech-xi'
		    className='button button--secondary'
		    onClick={closeMobileMenu}
		>
		    <span>Futtech XI</span>
		</Link>
		<Link
		    to='/home'
		    className='button button--secondary'
		    onClick={closeMobileMenu}
		>
		    <span>Home</span>
		</Link>
	    </nav>
	</header>
    );
};

export default PublicHeader;
