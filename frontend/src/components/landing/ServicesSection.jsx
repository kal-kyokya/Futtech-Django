const SERVICES = [
    {
	icon: '📊',
	title: 'Match Breakdown',
	description: 'Team or individual performance analysis',
    },
    {
	icon: '🎬',
	title: 'Player Highlight Reels',
	description: 'For scouts, recruitement, and social media',
    },
    {
	icon: '🧠',
	title: 'Tactical Analysis Videos',
	description: 'Focus on spacing, positioning, transitions',
    },
    {
	icon: '🏷️',
	title: 'Training Session Review & Tagging',
	description: 'Structured clips and moments for faster coaching feedback',
    },
    {
	icon: '📱',
	title: 'Short-form Football Content',
	description: 'TikTok / YouTube Shorts optimized edits',
    },
]

const ServicesSection = () => (
    <section
	className='landingSection servicesSection'
	aria-labelledby='services-heading'
    >
	<div className='landingSection__header'>
	    <h2 id='services-heading'>
		Services built for performance and growth
	    </h2>
	</div>
	<div className='servicesSection__grid'>
	    {SERVICES.map((service) => (
		<article
		    className='serviceCard'
		    key={service.title}
		>
		    <span
			className='serviceCard__icon'
			aria-hidden='true'
		    >
			{service.icon}
		    </span>
		    <h3>{service.title}</h3>
		    <p>{service.description}</p>
		</article>
	    ))}
	</div>
    </section>
);

export default ServicesSection;
