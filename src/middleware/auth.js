import { Hono } from 'hono';

/**
 * Authentication middleware to verify API keys.
 * Expects the API key in the 'X-API-Key' header.
 * Retrieves key details from the API_KEYS KV namespace.
 */
export const authMiddleware = async (c, next) => {
    const apiKey = c.req.header('x-api-key');

    if (!apiKey) {
        return c.json({ error: 'Unauthorized', message: 'API key is required.' }, 401);
    }

    const kvNamespace = c.env.API_KEYS;
    if (!kvNamespace) {
        console.error('Auth Middleware Error: API_KEYS KV namespace binding is missing.');
        return c.json({ error: 'Internal Server Error', message: 'Server configuration error.' }, 500);
    }

    try {
        const apiKeyData = await kvNamespace.get(apiKey, { type: 'json' });

        if (!apiKeyData) {
            return c.json({ error: 'Forbidden', message: 'Invalid API key.' }, 403);
        }

        if (!apiKeyData.enabled) {
            return c.json({ error: 'Forbidden', message: 'API key is disabled.' }, 403);
        }

        c.set('apiKeyData', apiKeyData);

        await next();

    } catch (error) {
        console.error('Auth Middleware KV Error:', error);
        return c.json({ error: 'Internal Server Error', message: 'An error occurred during authentication.' }, 500);
    }
}; 