import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating internet-related data.
 */
export const handleInternetData = (c) => {
    const locale = c.req.query('locale');
    const seed = c.req.query('seed');    const f = getFakerInstance(locale, seed);
    const count = getCount(c);
    console.log(`Handling /internet with locale: ${locale || 'en'}, count: ${count}`);

    const generate = () => ({
        ip: f.internet.ip(),
        ipv6: f.internet.ipv6(),
        mac: f.internet.mac(),
        userAgent: f.internet.userAgent(),
        domainName: f.internet.domainName(),
        url: f.internet.url(),
    });

    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 