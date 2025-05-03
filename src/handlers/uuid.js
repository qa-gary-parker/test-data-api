import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating UUIDs.
 */
export const handleUUID = (c) => {
    const seed = c.req.query('seed');    const f = getFakerInstance(undefined, seed); // Pass undefined for locale, get seed
    const count = getCount(c);
    console.log(`Handling /uuid with count: ${count}`);
    const generate = () => ({ uuid: f.string.uuid() });
    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 