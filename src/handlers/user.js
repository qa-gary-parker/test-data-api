import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating user data.
 */
export const handleUser = (c) => {
    const locale = c.req.query('locale');
    const seed = c.req.query('seed');    const f = getFakerInstance(locale, seed);
    const count = getCount(c);
    console.log(`Handling /user with locale: ${locale || 'en'}, count: ${count}`);

    const generate = () => ({
        firstName: f.person.firstName(),
        lastName: f.person.lastName(),
        email: f.internet.email(),
        username: f.internet.username(),
        avatar: f.image.avatar(),
    });

    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 