import './authLayout.scss';
import AuthHeroVideo from './AuthHeroVideo';
import AuthFormcard from './AuthFormcard';

const AuthLayout = ({
    pageClassName,
    header,
    videoTitle,
    formClassName = '',
    children,
}) => (
    <div className={`authPage ${pageClassName}`.trim()}>
	{header}
	<div className='authPage__container'>
	    <div className='authPage__panelGrid'>
		<AuthHeroVideo title={videoTitle} />
		<AuthFormCard className={formClassName}>
		    {children}
		</AuthFormCard>
	    </div>
	</div>
    </div>
);

export default AuthLayout;
