const AuthHeroVideo = ({ video, title = 'Futtech Preview', className = '' }) => (
    <section className={`authHeroVideo ${className}`.trim()} aria-label={title}>
	<h3>{title}</h3>
	<div className='authHeroVideo__frame'>
	    <iframe
		src={video}
		title='Futtech Bunny Stream preview video'
		loading='lazy'
		allow='autoplay; fullscreen; picture-in-picture'
		allowFullScreen
	    />
	</div>
    </section>
);

export default AuthHeroVideo;
