import { Hono } from 'hono';
// Import the main Faker class and necessary locales, including base
import { Faker, en, de, es, fr, base } from '@faker-js/faker';
// Helpers moved to separate file
import { getFakerInstance, getCount } from './helpers.js';
import { authMiddleware } from './middleware/auth.js'; // Import auth middleware
import { rateLimitMiddleware } from './middleware/rateLimit.js'; // Import rate limit middleware

// Import handlers
import { handleUser } from './handlers/user.js';
import { handleAddress } from './handlers/address.js';
import { handlePaymentCard } from './handlers/paymentCard.js';
import { handleCompany } from './handlers/company.js';
import { handleProduct } from './handlers/product.js';
import { handleInternetData } from './handlers/internet.js';
import { handleUUID } from './handlers/uuid.js';
import { handleProfile } from './handlers/profile.js';
import { handleDate } from './handlers/date.js';
import { handleLorem } from './handlers/lorem.js';
import { handleTransaction } from './handlers/transaction.js';
import { handleReadableText } from './handlers/readableText.js';

// Create a new Hono app
const app = new Hono();

// === Main Application Logic ===

// --- Public Routes (Define these FIRST) ---

// Root Endpoint - API Documentation
app.get('/', (c) => {
	const baseUrl = new URL(c.req.url).origin;
	// Maintain the list of endpoints here or generate dynamically later
	const endpoints = {
		'/ping': { description: "Simple health check.", example: `${baseUrl}/ping`, response: "pong (text/plain)" },
		'/user': { description: "Generates user data.", parameters: ["count", "locale", "seed"], example: `${baseUrl}/user?seed=123` },
		'/address': { description: "Generates address data.", parameters: ["count", "locale", "seed"], example: `${baseUrl}/address?locale=fr&seed=abc` },
		'/payment/card': { description: "Generates payment card data.", parameters: ["count", "locale", "type", "seed"], example: `${baseUrl}/payment/card?seed=456` },
		'/company': { description: "Generates company data.", parameters: ["count", "locale", "seed"], example: `${baseUrl}/company?seed=789` },
		'/product': { description: "Generates commerce product data.", parameters: ["count", "locale", "seed"], example: `${baseUrl}/product?seed=xyz` },
		'/internet': { description: "Generates internet-related data.", parameters: ["count", "locale", "seed"], example: `${baseUrl}/internet?seed=111` },
		'/uuid': { description: "Generates UUIDs.", parameters: ["count", "seed"], example: `${baseUrl}/uuid?seed=222` },
		'/profile': { description: "Generates a combined profile.", parameters: ["count", "locale", "seed"], example: `${baseUrl}/profile?seed=333` },
		'/date': { description: "Generates date/time data.", parameters: ["count", "locale", "format", "years", "refDate", "seed"], example: `${baseUrl}/date?seed=444` },
		'/lorem': { description: "Generates lorem ipsum text.", parameters: ["count", "type", "num", "seed"], example: `${baseUrl}/lorem?seed=555` },
		'/transaction': { description: "Generates finance transaction data.", parameters: ["count", "locale", "seed"], example: `${baseUrl}/transaction?seed=666` },
		'/readable_text': { description: "Generates readable text paragraphs.", parameters: ["count", "context", "seed"], example: `${baseUrl}/readable_text?seed=777` },
		// Add new endpoints here
	};
	return c.json({
		message: "Test Data Generation API",
		documention: "Provides various types of fake data for testing purposes.",
		endpoints: endpoints
	});
});

// Simple text ping
app.get('/ping', (c) => c.text("pong"));

// --- Test/Debug Routes (Use with caution!) ---

// IMPORTANT: This endpoint is for testing purposes ONLY to clear rate limit KV state.
// It allows deleting arbitrary `rate_limit:*` keys based on the path parameter.
// DO NOT expose this in a production environment without proper security controls
// (e.g., require a specific admin API key, environment variable checks).
app.delete('/test/rate-limit/:apiKey', async (c) => {
	const apiKeyToDelete = c.req.param('apiKey');
	if (!apiKeyToDelete) {
		return c.json({ error: 'Bad Request', message: 'API key parameter is required.' }, 400);
	}
	const kvNamespace = c.env.API_KEYS;
	if (!kvNamespace) {
		console.error('Rate Limit Clear Error: API_KEYS KV namespace binding is missing.');
		return c.json({ error: 'Internal Server Error', message: 'Server configuration error.' }, 500);
	}
	const kvKey = `rate_limit:${apiKeyToDelete}`;
	try {
		await kvNamespace.delete(kvKey);
		console.log(`[Test Endpoint] Deleted KV key: ${kvKey}`);
		return c.json({ success: true, message: `Rate limit key ${kvKey} deleted.` });
	} catch (error) {
		console.error(`[Test Endpoint] Error deleting KV key ${kvKey}:`, error);
		return c.json({ error: 'Internal Server Error', message: `Failed to delete key ${kvKey}.` }, 500);
	}
});

// --- Middleware Application for Protected Routes ---
// Apply auth and rate limiting to all subsequent routes defined *after* this point.
app.use('/*', authMiddleware); // Apply auth
app.use('/*', rateLimitMiddleware); // Apply rate limiting

// --- Protected Data Routes (Define AFTER middleware) ---
app.get('/user', (c) => c.json(handleUser(c)));
app.get('/address', (c) => c.json(handleAddress(c)));
app.get('/payment/card', (c) => c.json(handlePaymentCard(c)));
app.get('/company', (c) => c.json(handleCompany(c)));
app.get('/product', (c) => c.json(handleProduct(c)));
app.get('/internet', (c) => c.json(handleInternetData(c)));
app.get('/uuid', (c) => c.json(handleUUID(c)));
app.get('/profile', (c) => c.json(handleProfile(c)));
app.get('/date', (c) => c.json(handleDate(c)));
app.get('/lorem', (c) => c.json(handleLorem(c)));
app.get('/transaction', (c) => c.json(handleTransaction(c)));
app.get('/readable_text', (c) => handleReadableText(c));

// --- Error Handling ---
app.onError((err, c) => {
	console.error(`Error caught: ${err.message}`, err);
	// Check if it's one of our specific validation errors
	if (err.message.startsWith('Unsupported locale:') || err.message.startsWith('Invalid count parameter:')) {
		return c.json({ error: 'Bad Request', message: err.message }, 400);
	}
	// Generic fallback for other errors
	return c.json({ error: 'Internal Server Error', message: 'An unexpected error occurred.' }, 500);
});

// === Worker Entry Point ===

export default {
	fetch: app.fetch
}; 