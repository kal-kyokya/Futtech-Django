import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let initializedClientId = null;
let initializedGoogleAccountsId = null;
let activeCredentialCallback = null;

const loadGoogleScript = () =>
      new Promise((resolve, reject) => {
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

const initializeGoogleIdentity = (clientId) => {
    const googleAccountsId = window.google.accounts.id;
    if (
	initializedClientId === clientId &&
	    initializedGoogleAccountsId === googleAccountsId
    ) {
	return;
    }

    googleAccountsId.initialize({
	client_id: clientId,
	callback: (response) => activeCredentialCallback?.(response),
    });
    initializedClientId = clientId;
    initializedGoogleAccountsId = googleAccountsId;
};

const GoogleSignInButton = ({
    onSuccess,
    onError,
    disabled = false,
    text = 'signin_with',
}) => {
    const buttonRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    const successRef = useRef(onSuccess);
    const errorRef = useRef(onError);
    const disabledRef = useRef(disabled);
    successRef.current = onSuccess;
    errorRef.current = onError;
    disabledRef.current = disabled;

    useEffect(() => {
	const callback = (response) => {
	    if (!disabledRef.current) successRef.current?.(response);
	};
	activeCredentialCallback = callback;

	return () => {
	    if (activeCredentialCallback === callback) {
		activeCredentialCallback = null;
	    }
	};
    }, []);

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

		initializeGoogleIdentity(clientId);
		buttonRef.current.innerHTML = '';
		window.google.accounts.id.renderButton(buttonRef.current, {
		    theme: 'outline',
		    size: 'large',
		    width: Math.min(buttonRef.current.clientWidth || 320, 400),
		    text,
		});
		setReady(true);
	    })
	    .catch(() => {
		if (!cancelled) {
		    setLoadFailed(true);
		    errorRef.current?.({ silent: true });
		}
	    });

	return () => {
	    cancelled = true;
	};
    }, [clientId, text]);

    if (!clientId) {
	return null;
    }

    return (
	<div
	    className={
		disabled || !ready
		    ? 'googleSignIn googleSignIn--disabled'
		    : 'googleSignIn'
	    }
	>
	    <div ref={buttonRef} />
	    {loadFailed && (
		<p className='fieldError'>Google Sign-In is currently unavailable.</p>
	    )}
	</div>
    );
};

export default GoogleSignInButton;
