import './playlist.scss';
import { useRef } from 'react';
import PlaylistItem from '../playlistItem/PlaylistItem';

export default function Playlist({ playlist }) {
    const track = useRef(null);
    const items = Array.isArray(playlist.content) ? playlist.content : [];
    const scroll = (direction) =>
	  track.current?.scrollBy({
	      left: direction * track.current.clientWidth * 0.8,
	      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
		  ? 'auto'
		  : 'smooth',
	  });
    return (
	<section className='playlist' aria-label={playlist.title}>
	    <div className='playlist__heading'>
		<h3>{playlist.title}</h3>
		{items.length > 1 && (
		    <div className='playlist__controls'>
			<button
			    aria-label={`Previous videos in ${playlist.title}`}
			    onClick={() => scroll(-1)}
			>
			    ←
			</button>
			<button
			    aria-label={`Next videos in ${playlist.title}`}
			    onClick={() => scroll(1)}
			>
			    →
			</button>
		    </div>
		)}
	    </div>
	    {items.length ? (
		<div className='playlist__track' ref={track}>
		    {items.map((entry, index) => (
			<PlaylistItem
			    key={entry?.id || entry?._id || index}
			    videoId={
				typeof entry === 'object' ? entry?.id || entry?._id : entry
			    }
			    video={typeof entry === 'object' ? entry : null}
			    index={index}
			/>
		    ))}
		</div>
	    ) : (
		<p className='empty-state'>No videos in this playlist yet.</p>
	    )}
	</section>
    );
}
