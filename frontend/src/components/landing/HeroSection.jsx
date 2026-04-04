const HeroSection = () => (
    <section
	className='landingSection heroSection'
	aria-labelledby='hero-heading'
    >
	<div className='heroSection__content'>
	    <p className='heroSection__badge'>Football Video Analysis</p>
	    <h1 id='hero-heading'>
		Football Video Analysis | Match Breakdown, Player Analysis &amp; High-Performance Edits
	    </h1>
	    <p className='heroSection__subheadline'>
		We help football players, coaches and content creators turn raw match footage into clear, actionable insights.
	    </p>
	    <div className='heroSection__actions'>
		<a
		    className='button button--primary'
		    href='#registration-form'
		>
		    Get Your Video Analyzed
		</a>
		<a
		    className='button button--secondary'
		    href='https://player.mediadelivery.net/play/603147/5badff92-9cfa-4893-b1db-60b53d91c8de'
		    target='_blank'
		    rel='noopener noreferrer'
		>
		    View Sample Analysis
		</a>
	    </div>
	</div>

	<div
	    className='heroSection__preview'
	    aria-label='Video analysis preview'
	>
	    <div className='heroSection__previewFrame'>
		<iframe
		    title='Futtech sample football analysis'
		    src='https://player.mediadelivery.net/play/603147/5badff92-9cfa-4893-b1db-60b53d91c8de'
		    loading='lazy'
		    allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;'
		    allowFullScreen
		/>
	    </div>
	</div>
    </section>
);

export default HeroSection;
