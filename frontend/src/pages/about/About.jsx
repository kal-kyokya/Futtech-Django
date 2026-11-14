import './about.scss';
import ArrowCircleUpOutlinedIcon from '@mui/icons-material/ArrowCircleUpOutlined';
import PublicHeader from '../../components/publicHeader/PublicHeader';

const About = () => {
    return (
	<div id='page-top'>
	    <PublicHeader />
	    <a className='aboutAnchor' href='#page-top' aria-label='Back to top'>
		<ArrowCircleUpOutlinedIcon />
	    </a>

	    <main id='main-content' tabIndex={-1} className='about'>
		<div className='aboutTitle'>
		    <h1>Futtech</h1>
		    <em>
			A Journey of Engineering, Prototyping, Debugging & Entrepreneurship
		    </em>
		</div>

		<img
		    loading='lazy'
		    src='/registerPage.webp'
		    alt='Futtech Register page'
		/>
		<p>
		    Futtech is a startup that helps football players and coaches gain
		    tactical awareness of their strengths and weaknesses through online
		    provision of drone footage and Artificial Intelligent targeted
		    feedback.
		    <br />
		    As an engineering problem, it focuses on three objectives: creating a
		    web and mobile-friendly experience, building cost-effective
		    camera-equipped drones, and designing a reliable AI model.
		    <br />
		    This is the <i>web and mobile-friendly</i> online platform where
		    footage is captured, analyzed, published by the Futtech team, and
		    delivered back to users with a modern streaming and payments stack—
		    <a
			href='http://www.futtech.kalkyokya.tech'
			target='_blank'
			rel='noopener noreferrer'
		    >
			Demo here
		    </a>
		    .
		</p>

		<h2>WHY FUTTECH</h2>
		<p>
		    Being a big fan of Football, this was an easy project focus to commit
		    to. I am a hobbyist footballer, and recently learned that my father,
		    and his father before him, played for the great{' '}
		    <a
			href='https://en.wikipedia.org/wiki/TP_Mazembe#Honours'
			target='_blank'
			rel='noopener noreferrer'
		    >
			TP Mazembe
		    </a>{' '}
		    in Congo, DRC.
		    <br />
		    Over a year of training sessions revealed a frustrating pattern:{' '}
		    <b>tactical lessons often get lost</b> between sessions. Without tools
		    to track movements, analyze positioning and replay my actions,{' '}
		    <b>I repeated mistakes</b>.<br />
		    Instead of complaining, I decided to <b>build a solution</b>.
		</p>

		<h2>RESULTS</h2>
		<h3>Flow of Data through the System</h3>
		<img
		    loading='lazy'
		    src='/futtechArchitectureDiagram.png'
		    alt="Futtech's Architectural Diagram"
		/>
		<p>
		    <em>
			The drone captures video data, which is asynchronously sent to an AI
			processing unit—it analyzes footage and generates feedback on player
			positioning, movement, and decision-making. The resulting media is
			published to the web platform for user (players & coaches) access.
		    </em>
		</p>

		<h3>Technology Used</h3>
		<p>
		    Futtech began as a MERN experiment and has now transitioned to a{' '}
		    <b>React + Django REST</b> architecture.
		    <br />
		    The Django backend improved maintainability, API structure, and data
		    modeling for long-term product growth, while React +{' '}
		    <a
			href='https://www.w3schools.com/sass/sass_intro.asp'
			target='_blank'
			rel='noopener noreferrer'
		    >
			Sass
		    </a>{' '}
		    continue powering the client-side experience.
		</p>

		<h3>New Infrastructure in This Version</h3>
		<ul>
		    <li>
			<b>Bunny Stream</b> for reliable video ingestion, processing, and
			playback delivery
		    </li>
		    <li>
			<b>M-Pesa integration</b> to support local mobile-money payments for
			subscriptions and access control
		    </li>
		    <li>
			Structured Django services for video management, user, access, and
			transaction tracking
		    </li>
		</ul>

		<h3>Notable Features</h3>
		<ul>
		    <li>Google OAuth login/registration</li>
		    <li>Upload and management of video content through Bunny Stream</li>
		    <li>Subscription and payment workflows via M-Pesa</li>
		    <li>Time-based access control for premium analysis content</li>
		    <li>Content update and deletion functionality</li>
		</ul>

		<h2>MOST DIFFICULT TECHNICAL CHALLENGE</h2>
		<p>
		    I acquired the domain &#39;kalkyokya.tech&#39; in July 2024.
		    <br />
		    In January 2025, I set up Futtech as its subdomain, but after weeks
		    building it, deployment on my Ubuntu VPS presented challenges,
		    delaying the initial timeline.
		    <br />
		    I invested two days intensively learning deployment through articles
		    and YouTube tutorials. Armed with new knowledge, I successfully
		    deployed Futtech using PM2, Nginx, SSL (Let&#39;s Encrypt).
		    <br />
		    This immediately gave rise to a new challenge; Cross-Origin Resource
		    Sharing (
		    <a
			href='https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS'
			target='_blank'
			rel='noopener noreferrer'
		    >
			CORS
		    </a>
		    ). It took another two days to go through the documentation,
		    stackoverflow and YouTube tutorials to understand the bugs.
		    <br />
		    <br />
		    <em>
			Check{' '}
			<a
			    href='https://medium.com/blockchain-research-lab-akgec/the-ultimate-beginners-guide-to-deploying-a-mern-stack-on-ubuntu-with-nginx-pm2-and-ssl-by-let-s-50d3d1c355ef'
			    target='_blank'
			    rel='noopener noreferrer'
			>
			    this article
			</a>{' '}
			for a step-by-step deployment guide.
		    </em>
		</p>

		<h2>LESSONS LEARNED</h2>
		<h3>Technical Takeaways</h3>
		<p>
		    Migrating from MERN to Django reinforced the value of choosing backend
		    frameworks based on domain complexity and operational needs.
		    <br />
		    Integrating Bunny Stream and M-Pesa highlighted how product decisions
		    are often infrastructure decisions: developer velocity, reliability,
		    and regional payment realities all matter.
		</p>

		<h3>What I Might Do Differently</h3>
		<p>
		    I would introduce automated integration tests for payment callbacks
		    and streaming workflows earlier in the project lifecycle to reduce
		    regression risk as the platform scales.
		</p>

		<h3>What I Learned About Myself</h3>
		<p>
		    I am willing to put in long hours to master full-cycle software
		    development.
		    <br />
		    Thanks to my foundational training with{' '}
		    <a
			href='https://www.alxafrica.com/'
			target='_blank'
			rel='noopener noreferrer'
		    >
			ALX Africa
		    </a>
		    , I value understanding systems from the ground up, not just using
		    high-level abstractions.
		</p>

		<h3>How This Startup Informs My Engineering Path</h3>
		<blockquote>
		    &quot;Once you know what it is in life that you want to do, then the
		    world basically becomes your library. Everything you view, you can
		    view from that perspective, which makes everything a learning asset
		    for you.&quot;
		    <br />— Kobe Bryant
		</blockquote>
		<p>
		    This startup shows me the commitment and deep personal growth that
		    occurs when you are fully committed to solving a problem you care
		    about.
		</p>

		<h3>Confirming or Questioning Prior Beliefs</h3>
		<p>
		    I reaffirmed that simple lines of code, combined thoughtfully, build
		    powerful systems.
		    <br />I remain convinced that honesty and technical integrity are
		    essential to building scalable, sustainable applications.
		</p>

		<h2>Closing Thoughts</h2>
		<p>
		    The Django transition marks a new phase for Futtech: from prototype to
		    a more production-ready football intelligence platform.
		    <br />
		    There’s still much to build—from richer AI analysis to stronger
		    coaching workflows—but the current foundation is far more robust and
		    regionally practical thanks to services like Bunny Stream and M-Pesa.
		    <br />
		    <br />
		    Thank you for your time!
		    <br />— Jean-Paul De Marie KYOKYA Kalulu
		</p>

		<p>
		    <a
			href='https://futtech.kalkyokya.tech/'
			target='_blank'
			rel='noopener noreferrer'
		    >
			1. Official website
		    </a>
		    <br />
		    <a
			href='https://github.com/kal-kyokya/Futtech-Django'
			target='_blank'
			rel='noopener noreferrer'
		    >
			2. GitHub repository
		    </a>
		    <br />
		    <a
			href='https://www.linkedin.com/in/jean-paul-kyokya-b21892223/'
			target='_blank'
			rel='noopener noreferrer'
		    >
			3. LinkedIn Profile
		    </a>
		    <br />
		    <a
			href='https://medium.com/@kal-kyokya/the-futtech-startup-a-journey-of-engineering-prototyping-debugging-entrepreneurship-e3bfb91d2de5'
			target='_blank'
			rel='noopener noreferrer'
		    >
			4. Full article on Medium
		    </a>
		</p>

		<img
		    loading='lazy'
		    src='/poa.webp'
		    alt='Footballer standing beside a team bus'
		/>
	    </main>
	</div>
    );
};

export default About;
