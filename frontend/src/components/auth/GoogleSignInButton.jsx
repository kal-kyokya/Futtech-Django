import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const loadGoogleScript = () => new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
	resolve();
	return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
	if (existingScript.dataset.loaded === 'true') {
	    resolve();
	    return;
	}

	existingScript.addEventListener('load', resolve, { once: true });
	existingScript.addEventListener('error', reject, { once: true });
	return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
	script.dataset.loaded = 'true';
	resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
});

const GoogleSignInButton = ({ onSuccess, onError, disabled = false, text = 'signin_with' }) => {
    const buttonRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

    useEffect(() => {
	if (!clientId) {
	    return undefined;
	}

	let cancelled = false;
	setReady(false);
	setLoadFailed(false);

	loadGoogleScript()
	    .then(() => {
		if (cancelled || !buttonRef.current) {
		    return;
		}

		buttonRef.current.innerHTML = '';
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
		    setLoadFailed(true);
		    onError?.({ silent: true });
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
	<div className={disabled || !ready ? 'googleSignIn googleSignIn--disabled' : 'googleSignIn'}>
	    <div ref={buttonRef} />
	    {loadFailed && (
		<p className='fieldError'>Google Sign-In is currently unavailable.</p>
	    )}
	</div>
    );
};

export default GoogleSignInButton;
