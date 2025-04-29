import './about.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowCircleUpOutlinedIcon from '@mui/icons-material/ArrowCircleUpOutlined';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const About = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    window.onscroll = () => {
	setIsScrolled(window.pageYOffset === 0 ? false : true);

	return () => (window.onscroll = null);
    };

    return (
	<div id="page-top">
	    { isScrolled && (
		<a  className='link aboutAnchor' href="#page-top">
		    <ArrowCircleUpOutlinedIcon className='aboutAnchorArrow'/>
		</a>
	    )}

	    <nav className={ isScrolled ? "aboutNav scrolled" : "aboutNav"}>
		<Link className='link' to='/'>
		    <span className='iconLeft'>
			<ArrowBackIcon className='arrow'/>
			Home
		    </span>
		</Link>
		<div className="socials">
		    <span>Detailed version:&ensp;</span>
		    <a href="https://medium.com/@kal-kyokya"
		       target="_blank">
			<img alt="Medium badge"
	   		     src="https://img.shields.io/badge/Medium-black?logo=medium&logoColor=white"/>
		    </a>
		</div>
	    </nav>

	    <div className='about'>
		<div className="aboutTitle">
		    <h1>Futtech</h1>
		    <em>A Journey of Engineering, Prototyping, Debugging & Entrepreneurship</em>
		</div>

		<img src="/registerPage.png"
		     alt="Futtech Register page"/>
		<p>Futtech is a startup that helps football players and coaches gain tactical awareness of their strengths and weaknesses through online provision of drone footage and Artificial Intelligent targeted feedback.<br />
		    As an engineering problem, It focuses on three objectives: creating a web and mobile-friendly experience, building a cost-effective camera-equipped drone, and designing a reliable AI model.<br />
		This is the <i>web and mobile-friendly</i> online platform, onto which drone footage is to be uploaded before AI analysis and feedback generation—<a href="http://www.futtech.kalkyokya.tech">here</a>.</p>

		<h3>WHY FUTTECH</h3>
		<p>Being a big fan of Football, this was an easy project focus to commit to. I am a hobbyist footballer, and recently learned that my father, and his father before him, played for the great <a href="https://en.wikipedia.org/wiki/TP_Mazembe#Honours">TP Mazembe</a> in Congo, DRC.<br />
		    Over a year of training sessions revealed a frustrating pattern: <b>tactical lessons often get lost</b> between sessions. Without tools to track movements, analyze positioning and replay my actions, <b>I repeated mistakes</b>.<br />
		Instead of complaining, I decided to <b>build a solution</b>.</p>

		<h3>RESULTS</h3>
		<h4>Flow of Data through the System</h4>
		<img src="/futtechArchitectureDiagram.png"
		     alt="Futtech's Architectural Diagram"/>
		<p><em>The drone captures video data, which is asynchronously sent to an AI processing unit—it analyzes footage and generates feedback on player positioning, movement, and decision-making. The data is uploaded to the web platform for user (players & coaches) access.</em></p>

		<h4>Technology Used</h4>
		<p>Futtech is a MERN Stack Application.<br /> I chose this stack to grow my backend skills while learning React and <a href="https://www.w3schools.com/sass/sass_intro.asp">Sass</a> for building functional, scalable client-side interfaces.</p>

		<h4>Notable Features</h4>
		<ul>
		    <li>Google OAuth login/registration</li>
		    <li>Upload and management of video content</li>
		    <li>Content update and deletion functionality</li>
		</ul>

		<h3>MOST DIFFICULT TECHNICAL CHALLENGE</h3>
		<p>I acquired the domain 'kalkyokya.tech' in July 2024.<br />
		    In January 2025, I set up Futtech as its subdomain, but after weeks building it using MERN, deployment on my Ubuntu VPS presented challenges, delaying the initial timeline.<br />
		    I invested two days intensively learning deployment through articles and YouTube tutorials. Armed with new knowledge, I successfully deployed Futtech using PM2, Nginx, SSL (Let's Encrypt), and proper directory management.<br /><br />
		    <em>
			Check <a href="https://medium.com/blockchain-research-lab-akgec/the-ultimate-beginners-guide-to-deploying-a-mern-stack-on-ubuntu-with-nginx-pm2-and-ssl-by-let-s-50d3d1c355ef">
				  this article
			      </a> for a step-by-step deployment guide.
		    </em>
		</p>

		<h3>LESSONS LEARNED</h3>
		<h4>Technical Takeaways</h4>
		<p>The MERN stack offers a satisfying full-stack experience.<br />
		<a href="https://www.w3schools.com/sass/sass_intro.asp">Sass</a> improved my frontend understanding, and working through deployment deepened my backend expertise.</p>

		<h4>What I Might Do Differently</h4>
		<p>I would design automated test scripts to avoid overreliance on manual testing and debugging.</p>

		<h4>What I Learned About Myself</h4>
		<p>I am willing to put in long hours to master full-cycle software development.<br />
		    Thanks to my foundational training with <a href="https://www.alxafrica.com/">
								ALX Africa
							    </a>, I value understanding systems from the ground up, not just using high-level abstractions.</p>

		<h4>How This Startup Informs My Engineering Path</h4>
		<blockquote>
		    "Once you know what it is in life that you want to do, then the world basically becomes your library. Everything you view, you can view from that perspective, which makes everything a learning asset for you."<br />
		    — Kobe Bryant
		</blockquote>
		<p>This startup shows me the deep personal growth that occurs when you are fully committed to solving a problem you care about.</p>

		<h4>Confirming or Questioning Prior Beliefs</h4>
		<p>I reaffirmed that simple lines of code, combined thoughtfully, build powerful systems.<br />
		I remain convinced that honesty and technical integrity are essential to building scalable, sustainable applications.</p>

		<h3>Closing Thoughts</h3>
		<p>The journey toward completing Futtech and Everything IoT excites me.<br />
		    There’s much more to learn, and I look forward to growing both as an engineer and as a football player.<br /><br />
		    Thank you for reading!<br />
		— Jean-Paul De Marie KYOKYA Kalulu</p>

		<p>
		    <a href="https://github.com/kal-kyokya/Futtech">
			Link to GitHub for the project
		    </a><br />
		    <a href="https://futtech.kalkyokya.tech/">
			Link to the deployed project page
		    </a><br />
		    <a href="https://www.linkedin.com/in/jean-paul-kyokya-b21892223/">
			Link to my LinkedIn profile
		    </a>
		</p>

		<img src="/poa.JPEG"
		     alt="Futtech Register page"/>
	    </div>
	</div>
    );
};

export default About;
