import './futtechXI.scss';
import { useState } from 'react';
import PublicHeader from '../../components/publicHeader/PublicHeader';

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/futtech-xi/analyze`;
const INITIAL_QUERY = "Analyze Barcelona's attacking strengths and suggest three content ideas";

export default function Futtech() {
    const [query, setQuery] = useState(INITIAL_QUERY);
    const [state, setState] = useState('idle');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    async function submit(event) {
	event.preventDefault();

	setState('loading');
	setError('');
	setResult(null);

	try {
	    const response = await fetch(API,
					 {
					     method: 'POST',
					     headers: {
						 'Content-Type': 'application/json'
					     },
					     body: JSON.stringify({query})
					 });
	    const data = await response.json();

	    if (!reponse.ok) throw new Error(data.detail || 'Unable to complete analysis.');
	    setResult(data);
	    setState('done');
	} catch (err) {
	    setError(err.message);
	    setState('error');
	}
    };

    return <>
	       <PublicHeader />

	       <main className="xi-page">
		   <section className="xi-card">
		       <h2>Your four-agent football department</h2>
		       <p>Ask a football question. The workflow separates curated evidence, tactical interpretation, content production, and quality control.</p>

		       <form onSubmit={submit}>
			   <label htmlFor="football-question">Football question</label>
			   <textarea
			       id="football-question"
			       value={query}
			       onChange={e => setQuery(e.target.value)}
			       minLength="8"
			       required
			   />
			   <button disabled={state === 'loading'}>
			       {state === 'loading' ?
				'Analyzing...' :
				'Analyze with Futtech XI'
			       }
			   </button>
		       </form>

		       {state === 'loading' &&
			<p className="xi-status">
			    Researcher → Tactical Analyst → Content Strategist → Chief Analyst
			</p>
		       }

		       {error &&
			<p className="xi-erro">
			    {error}
			</p>}

		       {result &&
			<section className="xi-report">
			    <div className="xi-head">
				<div>
				    <p className="xi-eyebrow">
					FINAL REPORT
				    </p>
				    <h2>
					{result.report.match}
				    </h2>
				</div>
				<strong>
				    {Math.round(result.report.confidence * 100)}% confidence
				</strong>
			    </div>

			    <p className="xi-status">
				Agents completed: {result.agents.join(' · ')}
			    </p>

			    <h3>Key findings</h3>
			    <ul>
				{result.report.key_findings.map(item => <li key={item}>{item}</li>)}
			    </ul>

			    <h3>Tactical story</h3>
			    <p>{result.report.tactical_story}</p>

			    <h3>Content opportunities</h3>
			    <div className="xi-ideas">
				{result.report.content_opportunities.map(idea =>
				    <article key={idea.title}>
					<small>{idea.format}</small>
					<h4>{idea.title}</h4>
					<b>{idea.hook}</b>
					<p>{idea.insight}</p>
					<p>
					    <em>Visual:</em>
					    {idea.visual_treatment}
					</p>
				    </article>)
				}
			    </div>

			    <h3>Limitations</h3>
			    <ul>{result.report.limitations.map(item => <li key={item}>{item}</li>)}</ul>
			</section>}
		   </section>
	       </main>;
	   </>
};
