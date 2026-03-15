import axios from 'axios';

export type TenantBrand = {
    slug: string;
    name: string;
    logo: string | null;
    primary_color: string;
    description?: string;
};

const tenantService = {
    async fetchCurrentTenant(): Promise<TenantBrand> {
        const response = await axios.get('/api/tenant/current');
        return response.data;
    },
};

export default tenantService;
