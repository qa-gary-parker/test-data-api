import { getFakerInstance, getCount } from '../helpers.js';

/**
 * Handler for generating lorem ipsum text.
 */
export const handleLorem = (c) => {
    const seed = c.req.query('seed');    const f = getFakerInstance(undefined, seed); // Lorem doesn't use locale
    const count = getCount(c, 10); // Lower max count for lorem
    const type = c.req.query('type') || 'words'; // words, sentences, paragraphs
    const num = parseInt(c.req.query('num') || '5', 10); // Number of words/sentences/paragraphs

    console.log(`Handling /lorem with count: ${count}, type: ${type}, num: ${num}`);

    const generate = () => {
        let textValue;
        switch(type.toLowerCase()) {
            case 'sentences':
                textValue = f.lorem.sentences(num);
                break;
            case 'paragraphs':
                 textValue = f.lorem.paragraphs(num);
                break;
            case 'words':
            default:
                textValue = f.lorem.words(num);
                break;
        }
        return { text: textValue };
    };

    return count === 1 ? generate() : Array.from({ length: count }, generate);
}; 