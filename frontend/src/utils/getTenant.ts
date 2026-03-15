const getTenant = (): string => {
    const host = window.location.hostname;
    const parts = host.split('.').filter(Boolean);

    if (parts[0] === 'www' && parts.length > 3) {
        return parts[1];
    }

    if (parts.length > 2) {
        return parts[0];
    }

    return 'default';
};

export default getTenant;
