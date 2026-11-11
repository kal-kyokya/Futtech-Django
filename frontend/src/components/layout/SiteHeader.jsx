import ArrowUpRight from './ArrowUpRight';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './siteHeader.scss';

export default function SiteHeader({
    member = false,
    navigationId = 'public-header-navigation',
    onLogout,
    loggingOut = false,
}) {
    const [open, setOpen] = useState(false);
    const toggle = useRef(null);
    const more = useRef(null);
    const { pathname } = useLocation();

    useEffect(() => {
	setOpen(false);
	if (more.current) more.current.open = false;
    }, [pathname]);

    const close = () => {
	setOpen(false);
	if (more.current) more.current.open = false;
    };

    const links = member
	  ? [
              ['/home', 'Overview'],
              ['/videos', 'Videos'],
              ['/drone-videos', 'Drone footage'],
              ['/ai-analysis', 'Analysis'],
              ['/playlists', 'Playlists'],
	  ]
	  : [
              ['/showcase', 'Showcase'],
              ['/futtech-xi', 'Futtech XI'],
              ['/about', 'About'],
	  ];

    return (
	<header
	    className='siteHeader'
	    onKeyDown={(event) => {
		if (event.key === 'Escape') {
		    const moreWasOpen = more.current?.open;
		    close();
		    if (moreWasOpen) more.current.querySelector('summary')?.focus();
		    else toggle.current?.focus();
		}
	    }}
	>

	    <div className='siteHeader__inner'>
		<Link
		    to={member ? '/home' : '/'}
		    className='siteHeader__brand'
		    aria-label='Futtech home'
		>
		    <img src='/logo.png' alt='' width='36' height='36' />
		    <span>
			futtech<span className='siteHeader__dot'>.</span>
		    </span>
		</Link>

		<button
		    ref={toggle}
		    className='siteHeader__toggle'
		    aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
		    aria-expanded={open}
		    aria-controls={navigationId}
		    onClick={() => setOpen(!open)}
		>
		    <svg
			width='20'
			height='20'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.7'
			aria-hidden='true'
		    >
			<path
			    d={open ? 'm6 6 12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'}
			/>
		    </svg>
		</button>

		<nav
		    id={navigationId}
		    aria-label='Main navigation'
		    className={`siteHeader__nav ${open ? 'active' : ''}`}
		>
		    {links.map(([path, label]) => (
			<NavLink key={path} to={path} onClick={close}>
			    {label}
			</NavLink>
		    ))}
		    {member && (
			<details ref={more} className='siteHeader__more'>
			    <summary>More</summary>
			    <div className='siteHeader__moreMenu'>
				{[
				    ['/showcase', 'Showcase'],
				    ['/futtech-xi', 'Futtech XI'],
				    ['/about', 'About'],
				    ['/new-playlist', 'New playlist'],
				    ['/pricing-page', 'Subscription'],
				].map(([path, label]) => (
				    <NavLink key={path} to={path} onClick={close}>
					{label}
				    </NavLink>
				))}
			    </div>
			</details>
		    )}
		    {member ? (
			<div className='siteHeader__actions'>
			    <NavLink to='/profile' onClick={close}>
				Profile
			    </NavLink>
			    <button onClick={onLogout} disabled={loggingOut}>
				{loggingOut ? 'Signing out…' : 'Logout'}
			    </button>
			</div>
		    ) : (
			<div className='siteHeader__actions'>
			    <NavLink to='/login' onClick={close}>
				Log In
			    </NavLink>
			    <Link
				to='/register#registration-form'
				className='button button--primary'
				onClick={close}
			    >
				Get started <ArrowUpRight />
			    </Link>
			</div>
		    )}
		</nav>
	    </div>
	</header>
    );
}
