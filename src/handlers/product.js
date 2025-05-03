import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating commerce product data.
 */
export const handleProduct = (c) => {
    const locale = c.req.query('locale');
    const seed = c.req.query('seed');    const f = getFakerInstance(locale, seed);
    const count = getCount(c);
    console.log(`Handling /product with locale: ${locale || 'en'}, count: ${count}`);

    const generate = () => ({
        name: f.commerce.productName(),
        price: f.commerce.price(),
        department: f.commerce.department(),
        description: f.commerce.productDescription(),
        material: f.commerce.productMaterial(),
    });

    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 