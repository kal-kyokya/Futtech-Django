const AuthHeroVideo = ({ title = 'Futtech Preview', className = '' }) => (
    <section className={`authHeroVideo ${className}`.trim()} aria-label={title}>
	<h3>{title}</h3>
	<div className='authVideoFrame__frame'>
	    <iframe
		src='https://player.mediadelivery.net/embed/603147/bfb7224d-d5f5-4239-9370-395750a5798f'
		title='Futtech Bunny Stream preview video'
		loading='lazy'
		allow='loop; autoplay; fullscreen; picture-in-picture'
		allowFullScreen
	    />
	</div>
    </section>
);

export default AuthHeroVideo;
