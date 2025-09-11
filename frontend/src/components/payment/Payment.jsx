import { useEffect, useRef } from 'react';

const Payment = ({ pricingTableId, publishableKey }) => {
    const ref = useRef();

    useEffect(() => {
	if (!ref.current) return;

	// Set attributes manually to be React-safe
	ref.current.setAttribute('pricing-table-id', pricingTableId);
	ref.current.setAttribute('publishable-key', publishableKey);
    }, [pricingTableId, publishableKey]);

    return (
	    <stripe-pricing-table ref={ref}>
	    </stripe-pricing-table>
    );
};

export default Payment;
