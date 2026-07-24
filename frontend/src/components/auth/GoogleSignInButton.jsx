import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

const loadGoogleScript = () => new Promise(() => {
    if (window.google?.accounts?.id) {
	resolve();
	return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
	existingScript.addEventListener('load', resolve, { once: true });
	existingScript.addEventListener('error', reject, { once: true });
	return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://account.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
});

const GoogleSignInButton = ({ onSuccess, onError, disabled = false, text = 'signin_with' }) => {
    const buttonRef = useRef(null);
    const [ready, setReady] = useState(false);
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

    useEffect(() => {
	if (!clientId) {
	    return undefined;
	}

	let cancelled = false;
	loadGoogleScript()
	    .then(() => {
		if (cancelled || !buttonRef.current) {
		    return;
		}
		window.google.accounts.id.initialize({
		    client_id: clientId,
		    callback: onSuccess,
		});
		window.google.accounts.id.renderButton(buttonRef.current, {
		    theme: 'outline',
		    size: 'large',
		    width: buttonRef.current.offsetWidth || 320,
		    text,
		});
		setReady(true);
	    })
	    .catch(() => {
		if (!cancelled) {
		    onError?.();
		}
	    });

	return () => {
	    cancelled = true;
	};
    }, [clientId, onError, onSuccess, text]);

    if (!clientId) {
	return null;
    }

    return (
	<div classname={disabled || !ready ? 'googleSignIn googleSignIn--disabled' : 'googleSignIn'}>
	    <div ref={buttonRef} />
	</div>
    );
};

export default GoogleSignInButton;
