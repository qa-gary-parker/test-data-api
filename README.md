# Test Data Generation API

A simple Cloudflare Worker API for generating various types of fake data for testing purposes. Built with Hono and @faker-js/faker.

## Features

*   Provides multiple endpoints for different data categories (user, address, company, product, etc.).
*   Supports generating multiple items via the `count` query parameter.
*   Supports basic localization via the `locale` query parameter for relevant endpoints.
*   Deployed on Cloudflare Workers for global availability and low cost.

## Setup and Installation

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <your-repo-url>
    cd test-data-api
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Cloudflare Account & Wrangler:**
    *   Ensure you have a Cloudflare account.
    *   Install the Wrangler CLI globally: `npm install -g wrangler`
    *   Log in to your Cloudflare account: `wrangler login`

## Local Development

To run the API locally for testing:

```bash
wrangler dev
```

This will start a local server, typically at `http://127.0.0.1:8787`. You can access the API endpoints using `curl` or your browser.

## Deployment

To deploy the API to your Cloudflare account:

```bash
wrangler deploy
```

This will publish the worker to a `*.workers.dev` subdomain (or a custom domain if configured). The command output will show the deployed URL.

## API Endpoints

The base URL will be your deployed `workers.dev` URL (e.g., `https://test-data-api.<your-subdomain>.workers.dev`) or `http://127.0.0.1:8787` during local development.

**Common Parameters:**

*   `count=N`: (Optional) Specify the number of items to generate (integer, 1-50). If omitted or invalid, defaults to 1. Returns an array if `count > 1`.
*   `locale=XX`: (Optional) Specify the locale for data generation. Supported: `en` (default), `de`, `es`, `fr`, `it`, `ja`, `pt_br`, `zh_cn`. Affects data like names, addresses, etc., where applicable.
*   `seed=value`: (Optional) Provide a string or number seed for reproducible results.

**Endpoints:**

*   **`/`**
    *   Description: Returns API documentation and available endpoints.
    *   Method: `GET`
    *   Example: `GET /`
*   **`/ping`**
    *   Description: Simple health check.
    *   Method: `GET`
    *   Example: `GET /ping`
    *   Response: `pong` (text/plain)
*   **`/user`**
    *   Description: Generates user data (name, email, username, avatar).
    *   Method: `GET`
    *   Parameters: `count`, `locale`
    *   Example: `GET /user?count=2&locale=de`
*   **`/address`**
    *   Description: Generates address data (street, city, state, zip, country, lat/lon).
    *   Method: `GET`
    *   Parameters: `count`, `locale`
    *   Example: `GET /address?locale=fr`
*   **`/payment/card`**
    *   Description: Generates payment card data.
    *   Method: `GET`
    *   Parameters: `count`, `locale`, `type` (e.g., `visa`, `mastercard`)
    *   Example: `GET /payment/card?count=1&type=visa`
*   **`/company`**
    *   Description: Generates company data (name, catchphrase).
    *   Method: `GET`
    *   Parameters: `count`, `locale`
    *   Example: `GET /company?count=3`
*   **`/product`**
    *   Description: Generates commerce product data.
    *   Method: `GET`
    *   Parameters: `count`, `locale`
    *   Example: `GET /product?locale=es`
*   **`/internet`**
    *   Description: Generates internet-related data (IP, MAC, User Agent, etc.).
    *   Method: `GET`
    *   Parameters: `count`, `locale`
    *   Example: `GET /internet?count=2`
*   **`/uuid`**
    *   Description: Generates UUIDs.
    *   Method: `GET`
    *   Parameters: `count`
    *   Example: `GET /uuid?count=5`
*   **`/profile`**
    *   Description: Generates a combined user and address profile.
    *   Method: `GET`
    *   Parameters: `count`, `locale`
    *   Example: `GET /profile?locale=de`
*   **`/readable_text`**
    *   Description: Generates readable text paragraphs for UI mockups, optionally filtered by context.
    *   Method: `GET`
    *   Parameters: `count` (1-4 per context), `context` (Available: `general`, `technology`, `business`, `design`)
    *   Example: `GET /readable_text?context=technology&count=2`

---

_This README was generated based on the API structure as of 2024-05-03._ 