import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating a combined user and address profile.
 */
export const handleProfile = (c) => {
    const locale = c.req.query('locale');
    const seed = c.req.query('seed');    const f = getFakerInstance(locale, seed);
    const count = getCount(c);
    console.log(`Handling /profile with locale: ${locale || 'en'}, count: ${count}`);

    const generate = () => ({
        user: {
            firstName: f.person.firstName(),
            lastName: f.person.lastName(),
            email: f.internet.email(),
            username: f.internet.username(),
        },
        address: {
            streetAddress: f.location.streetAddress(),
            city: f.location.city(),
            state: f.location.state({ abbreviated: true }),
            zipCode: f.location.zipCode(),
            country: f.location.country(),
        }
    });
     return count === 1 ? generate() : Array.from({ length: count }, generate);
} 