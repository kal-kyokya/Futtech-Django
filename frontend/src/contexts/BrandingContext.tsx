import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import tenantService, { type TenantBrand } from '../services/tenantService';
import getTenant from '../utils/getTenant';

type BrandingContextShape = {
    brand: TenantBrand;
    tenantSlug: string;
    isLoading: boolean;
};

const defaultBrand: TenantBrand = {
    slug: 'default',
    name: 'Futtech',
    logo: '/logo.png',
    primary_color: '#028ECA',
    description: 'Default Futtech branding',
};

const BrandingContext = createContext<BrandingContextShape>({
    brand: defaultBrand,
    tenantSlug: 'default',
    isLoading: true,
});

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
    const [brand, setBrand] = useState<TenantBrand>(defaultBrand);
    const [isLoading, setIsLoading] = useState(true);
    const tenantSlug = useMemo(() => getTenant(), []);

    useEffect(() => {
        let active = true;

        const loadBranding = async () => {
            try {
                const data = await tenantService.fetchCurrentTenant();
                if (active) {
                    setBrand(data || defaultBrand);
                }
            } catch (error) {
                console.warn('Falling back to default branding.', error);
                if (active) {
                    setBrand(defaultBrand);
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadBranding();

        return () => {
            active = false;
        };
    }, [tenantSlug]);

    useEffect(() => {
        document.title = `${brand.name} | Futtech`;
        document.documentElement.style.setProperty('--tenant-primary-color', brand.primary_color || '#028ECA');
        document.documentElement.style.setProperty('--main-color', brand.primary_color || '#028ECA');
    }, [brand]);

    const value = useMemo(() => ({ brand, tenantSlug, isLoading }), [brand, tenantSlug, isLoading]);

    return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export const useBranding = () => useContext(BrandingContext);