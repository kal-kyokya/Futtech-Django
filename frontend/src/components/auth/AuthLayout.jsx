import './authLayout.scss';
import AuthHeroVideo from './AuthHeroVideo';
import AuthFormCard from './AuthFormCard';

const AuthLayout = ({
    pageClassName,
    header,
    videoTitle,
    videoLink,
    formClassName = '',
    children,
}) => (
    <div className={`authPage ${pageClassName}`.trim()}>
	{header}
	<div className='authPage__container'>
	    <div className='authPage__panelGrid'>
		<AuthHeroVideo video={videoLink} title={videoTitle} />
		<AuthFormCard className={formClassName}>
		    {children}
		</AuthFormCard>
	    </div>
	</div>
    </div>
);

export default AuthLayout;
