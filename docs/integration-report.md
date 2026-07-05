# Backend Integration Report — URL Shortener API

**Author:** Backend (url-shortener-api)  
**Audience:** Frontend (url-shortener-front)  
**Date:** 2026-06-02  
**Contract ref:** `docs/backend-contract.md` (2026-06-01)

---

## Status

| Item | Status |
|---|---|
| `GET /api/urls` | Complete |
| `POST /api/urls` | Complete |
| `DELETE /api/urls/{id}` | Complete |
| `GET /{alias}` redirect handler | Complete |
| Data model matches contract shape | Complete |
| Error response format | Complete |
| Database migration | Written — pending apply (see §5) |

---

## 1. Endpoints

All routes are live on the Flask server. Base URL for local development: `http://localhost:5000`.

### 1.1 List all URLs

```
GET /api/urls
```

Returns a JSON array ordered by `createdAt` descending. Returns `[]` when empty — never `null`.

**Sample response — 200 OK**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "originalUrl": "https://example.com/very/long/path",
    "transformedUrl": "http://localhost:5000/abc123",
    "alias": "abc123",
    "transformationType": "Shorten",
    "clicks": 3,
    "createdAt": "2026-06-02T10:00:00.000Z",
    "status": "Active"
  }
]
```

---

### 1.2 Create a short URL

```
POST /api/urls
Content-Type: application/json
```

**Request body**

```json
{
  "originalUrl": "https://example.com/very/long/path",
  "transformationType": "Shorten"
}
```

**Response — 201 Created**

Returns the newly created `TransformedURL` object. `alias` is a 6-character alphanumeric string. `clicks` is `0`. `createdAt` is the current UTC timestamp.

**Validation errors — 400 Bad Request**

```json
{ "error": "originalUrl is required" }
{ "error": "originalUrl must be a valid http or https URL" }
{ "error": "transformationType must be \"Shorten\"" }
```

**Alias collision failure — 500**

```json
{ "error": "Could not generate a unique alias, please try again" }
```

---

### 1.3 Delete a URL

```
DELETE /api/urls/{id}
```

`{id}` is the UUID returned in the `id` field of a `TransformedURL`.

**Response — 204 No Content**

Empty body.

**Response — 404 Not Found**

```json
{ "error": "URL not found" }
```

---

### 1.4 Redirect handler

```
GET /{alias}
```

Not called by the frontend directly — triggered when a user visits a short URL in the browser. The server:

1. Looks up the alias.
2. Increments `clicks` by 1.
3. Responds **302 Found** → `originalUrl`.

Returns `{ "error": "URL not found" }` with **404** if the alias does not exist.

---

## 2. Data Model

Every response object conforms exactly to the `TransformedURL` contract shape. All field names are camelCase.

```
TransformedURL {
  id               string    UUID, e.g. "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  originalUrl      string    the original long URL
  transformedUrl   string    "{APP_DOMAIN}/{alias}"
  alias            string    6-character alphanumeric, e.g. "xK9mPq"
  transformationType  "Shorten"
  clicks           number    starts at 0, incremented on each redirect
  createdAt        string    ISO 8601 UTC, e.g. "2026-06-02T10:00:00.000Z"
  status           "Active"
}
```

---

## 3. Error Format

All error responses use the contract-specified envelope:

```json
{ "error": "<human-readable message>" }
```

| Scenario | Status |
|---|---|
| Missing or invalid field | 400 |
| Record not found | 404 |
| Alias collision unresolved | 500 |
| Unhandled server error | 500 |

---

## 4. Local Development Setup

The Flask server runs on **port 5000** by default.

```
# in url_shortener_api/
python manage.py
```

`APP_DOMAIN` in `.env` defaults to `http://localhost:5000` and controls the `transformedUrl` host. Update it to your production domain before deploying.

### Vite proxy config

Add the following to the frontend `vite.config.ts` so the dev server forwards API calls and short-URL visits to Flask:

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      // Catch-all for short URL redirects — must come after any real frontend routes.
      // Adjust the regex to match your alias format (6 alphanumeric chars).
      '^/[A-Za-z0-9]{6}$': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 5. Database Migration — Action Required

The backend schema was updated to match the contract (UUID primary key, renamed columns, new fields). The migration file is written and ready at:

```
migrations/versions/a1f3c5e7b9d2_frontend_contract_schema.py
```

The migration **has not been applied** because the Supabase project is currently unreachable (project appears paused on the free tier). Once the project is resumed:

```
python -m flask db upgrade
```

The migration drops the old `urls` table and recreates it with the new schema. **Any existing rows will be lost** — acceptable given this is a dev environment.

---

## 6. Out of Scope (not implemented per contract §8)

- Authentication / user accounts
- Custom aliases
- URL archiving
- Per-referrer or time-series click analytics
- Pagination
- Growth statistics
- "Clean" transformation type
