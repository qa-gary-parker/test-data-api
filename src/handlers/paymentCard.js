import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating payment card data.
 */
export const handlePaymentCard = (c) => {
    const locale = c.req.query('locale');
    const seed = c.req.query('seed');    const f = getFakerInstance(locale, seed);
    const count = getCount(c);
    const cardType = c.req.query('type')?.toLowerCase();
    console.log(`Handling /payment/card with locale: ${locale || 'en'}, count: ${count}, type: ${cardType || 'any'}`);

    const generate = () => ({
        cardType: cardType || f.finance.creditCardIssuer(),
        cardNumber: f.finance.creditCardNumber(cardType),
        cardCvv: f.finance.creditCardCVV(),
        cardExpiry: `${f.date.future({ years: 3 }).getMonth() + 1}/${f.date.future({ years: 3 }).getFullYear()}`,
    });

    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 