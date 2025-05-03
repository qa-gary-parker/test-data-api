import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating date/time data.
 */
export const handleDate = (c) => {
    // Date generation doesn't typically use locale heavily, but we get instance for future use
    const seed = c.req.query('seed');    const f = getFakerInstance(c.req.query('locale'), seed);
    const count = getCount(c);
    const format = c.req.query('format') || 'iso'; // iso, unix, recent, soon
    const years = parseInt(c.req.query('years') || '1', 10);
    const refDate = c.req.query('refDate'); // Optional reference date for recent/soon

    console.log(`Handling /date with count: ${count}, format: ${format}, years: ${years}`);

    const generate = () => {
        let dateValue;
        switch(format.toLowerCase()) {
            case 'unix':
                dateValue = f.date.anytime().getTime(); // Milliseconds since epoch
                break;
            case 'recent':
                dateValue = f.date.recent({ days: years * 365, refDate: refDate });
                break;
            case 'soon':
                 dateValue = f.date.soon({ days: years * 365, refDate: refDate });
                break;
            case 'past':
                 dateValue = f.date.past({ years: years, refDate: refDate });
                 break;
            case 'future':
                  dateValue = f.date.future({ years: years, refDate: refDate });
                  break;
            case 'iso':
            default:
                dateValue = f.date.anytime().toISOString();
                break;
        }
        return { date: dateValue };
    };

    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 