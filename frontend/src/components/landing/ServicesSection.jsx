const SERVICES = [
    {
	icon: '01',
	title: 'Match Breakdown',
	description: 'Team or individual performance analysis',
    },
    {
	icon: '02',
	title: 'Player Highlight Reels',
	description: 'For scouts, recruitment, and social media',
    },
    {
	icon: '03',
	title: 'Tactical Analysis Videos',
	description: 'Focus on spacing, positioning, transitions',
    },
    {
	icon: '04',
	title: 'Training Session Review & Tagging',
	description: 'Structured clips and moments for faster coaching feedback',
    },
    {
	icon: '05',
	title: 'Short-form Football Content',
	description:
	'Instagram Reels / TikTok Videos / YouTube Shorts optimized edits',
    },
];

const ServicesSection = () => (
    <section
	className='landingSection servicesSection'
	aria-labelledby='services-heading'
    >
	<div className='landingSection__header'>
	    <h2 id='services-heading'>Services built for performance and growth</h2>
	</div>
	<div className='servicesSection__grid'>
	    {SERVICES.map((service) => (
		<article className='serviceCard' key={service.title}>
		    <span className='serviceCard__icon' aria-hidden='true'>
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
