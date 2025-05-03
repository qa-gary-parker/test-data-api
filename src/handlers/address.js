import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating address data.
 */
export const handleAddress = (c) => {
    const locale = c.req.query('locale');
    const seed = c.req.query('seed');    const f = getFakerInstance(locale, seed);
    const count = getCount(c);
    console.log(`Handling /address with locale: ${locale || 'en'}, count: ${count}`);

    const generate = () => ({
        streetAddress: f.location.streetAddress(),
        city: f.location.city(),
        state: f.location.state({ abbreviated: true }),
        zipCode: f.location.zipCode(),
        country: f.location.country(),
        latitude: f.location.latitude(),
        longitude: f.location.longitude(),
    });

    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 