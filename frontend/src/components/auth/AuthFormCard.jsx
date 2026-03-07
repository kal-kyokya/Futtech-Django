const AuthFormCard = ({ children, className = '' }) => (
    <div className={`authFormCard ${className}`.trim()}>
	{children}
    </div>
);

export default AuthFormCard;
