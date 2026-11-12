import ArrowUpRight from '../layout/ArrowUpRight';
import './landing.scss';
import { Link } from 'react-router-dom';

export default function HeroSection({ member = false, category }) {
    return (
	<section
	    className='landingSection heroSection'
	    aria-labelledby='hero-heading'
	>
	    <div className='heroSection__content'>
		<p className='eyebrow'>
		    {member ? 'YOUR FOOTBALL WORKSPACE' : 'SEE THE GAME DIFFERENTLY'}
		</p>
		<h1 id='hero-heading'>
		    {category === 'drone' ? (
			<>
			    A wider view.
			    <br />A sharper <span>perspective.</span>
			</>
		    ) : category === 'analysis' ? (
			<>
			    Read the game.
			    <br />
			    Find your <span>next move.</span>
			</>
		    ) : (
			<>
			    Your footage.
			    <br />A clearer <span>game plan.</span>
			</>
		    )}
		</h1>
		<p className='heroSection__subheadline'>
		    Turn match footage into meaningful progress. Football analysis that
		    helps players see more, coaches teach better, and talent stand out.
		</p>
		<div className='heroSection__actions'>
		    <Link className='button button--primary' to='/futtech-xi'>
			Start your first analysis <ArrowUpRight />
		    </Link>
		    <Link className='button button--secondary' to='/showcase'>
			Explore the showcase
		    </Link>
		</div>
		<p className='heroSection__footnote'>
		    Built for players. Informed by the game.
		</p>
	    </div>
	    <figure className='heroSection__preview'>
		<div className='heroSection__previewHeading'>
		    <span className='eyebrow'>THE GAME, IN FOCUS</span>
		    <span>01 / Match analysis</span>
		</div>
		<div className='heroSection__previewFrame'>
		    <iframe
			title='Futtech sample football analysis'
			src='https://iframe.mediadelivery.net/embed/603147/5badff92-9cfa-4893-b1db-60b53d91c8de?loop=true'
			loading='lazy'
			allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;'
			allowFullScreen
		    />
		</div>
		<figcaption>
		    <span>More than a highlight reel.</span> A new perspective on every
		    play.
		</figcaption>
	    </figure>
	</section>
    );
}
