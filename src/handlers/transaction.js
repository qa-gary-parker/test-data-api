import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating basic finance transaction data.
 */
export const handleTransaction = (c) => {
    const locale = c.req.query('locale');
    const seed = c.req.query('seed');    const f = getFakerInstance(locale, seed);
    const count = getCount(c);

    console.log(`Handling /transaction with locale: ${locale || 'en'}, count: ${count}`);

    const generate = () => ({
        amount: f.finance.amount(),
        currencyCode: f.finance.currencyCode(),
        currencyName: f.finance.currencyName(),
        currencySymbol: f.finance.currencySymbol(),
        account: f.finance.accountNumber(),
        transactionType: f.finance.transactionType(),
        transactionDescription: f.finance.transactionDescription(),
    });

    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 