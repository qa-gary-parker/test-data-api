import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating company data.
 */
export const handleCompany = (c) => {
    const locale = c.req.query('locale');
    const seed = c.req.query('seed');    const f = getFakerInstance(locale, seed);
    const count = getCount(c);
    console.log(`Handling /company with locale: ${locale || 'en'}, count: ${count}`);

    const generate = () => ({
        name: f.company.name(),
        catchPhrase: f.company.catchPhrase(),
    });

    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 