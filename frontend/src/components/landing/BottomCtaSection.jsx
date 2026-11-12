import { Link } from 'react-router-dom';
const BottomCtaSection = () => (
    <section
	className='landingSection bottomCtaSection'
	aria-labelledby='bottom-cta-heading'
    >
	<h2 id='bottom-cta-heading'>Make your next match a step forward.</h2>
	<Link className='button button--primary' to='/futtech-xi'>
	    Start Your First Analysis
	</Link>
    </section>
);

export default BottomCtaSection;
