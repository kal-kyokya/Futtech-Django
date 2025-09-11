import useState from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Payment from '../../components/payment/Payment';


// Re-using the same conceptual API service as in '../watch/Watch'
const apiService = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    interceptors: {
	request: (config) => {
	    const user = JSON.parse(localStorage.getItem('user'));
	    if (user && user.accessToken) {
		config.headers.Authorization = `Bearer ${user.accessToken}`;
	    }
	    return config;
	},
    },
});

const Pricing = () => {
    const [pricingTableId, setPricingTableId] = useState(null);
    const [publishableKey, setPublishableKey] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));

    const IdentifierRes = apiService.get('api/pricing-page-identifiers/');
    setPricingTableId(IdentifierRes.data.stripe_pricing_table_id);
    setPublishableKey(IdentifierRes.data.stripe_public_key);

    return (
	<>
	    <Navbar />
	    <Payment pricingTableId={ pricingTableId }
		     publishableKey={ publishableKey }
		     clientReferenceId={ user.id }
	    />
	</>
    );
};

export default Pricing;
