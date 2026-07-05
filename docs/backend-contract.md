# Backend Contract — URL Shortener

**Document owner:** Frontend (url-shortener-front)  
**Target backend:** Flask server  
**Date:** 2026-06-01  

---

## 1. Overview

The frontend is a React SPA that communicates with the backend over HTTP/JSON. It needs three REST API endpoints to manage shortened URLs, plus a redirect handler for when a short URL is visited. There is no authentication. All API routes are prefixed with `/api`.

---

## 2. Base URL & Hosting

- The frontend and backend are served from the **same domain** (no CORS issues in production).
- Short URLs use the **same domain** as the app: `{APP_DOMAIN}/{alias}`.  
  Example: if the app is at `https://shorty.app`, a short URL looks like `https://shorty.app/abc123`.
- During local development, the frontend proxies `/api/*` and `/{alias}` requests to the Flask server. The frontend Vite config should be updated to point to the Flask server port.

---

## 3. Data Model

Every URL resource returned by the API must conform to this shape. Field names and types are strict — the frontend deserializes directly into this structure.

```
TransformedURL {
  id               string      — unique identifier (UUID recommended)
  originalUrl      string      — the original long URL submitted by the user
  transformedUrl   string      — the full short URL: "{APP_DOMAIN}/{alias}"
  alias            string      — the short path segment, e.g. "abc123"
  transformationType  "Shorten"   — always this literal value for now
  clicks           number      — total redirect count, incremented server-side
  createdAt        string      — ISO 8601 UTC timestamp, e.g. "2026-06-01T18:00:00.000Z"
  status           "Active"    — always this literal value for now
}
```

---

## 4. API Endpoints

### 4.1 List all URLs

```
GET /api/urls
```

Returns every stored URL, ordered by `createdAt` descending (newest first).

**Response — 200 OK**

```json
[
  {
    "id": "a1b2c3d4-...",
    "originalUrl": "https://example.com/very/long/path",
    "transformedUrl": "https://shorty.app/abc123",
    "alias": "abc123",
    "transformationType": "Shorten",
    "clicks": 42,
    "createdAt": "2026-06-01T18:00:00.000Z",
    "status": "Active"
  }
]
```

Returns an empty array `[]` when no URLs exist — never `null`.

---

### 4.2 Create a short URL

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

**Validation rules**

| Field | Rule |
|---|---|
| `originalUrl` | Required. Must be a valid, fully-qualified URL (has scheme `http` or `https`). |
| `transformationType` | Required. Must equal `"Shorten"`. |

**Response — 201 Created**

Returns the newly created `TransformedURL` object. The backend is responsible for:

- Generating a unique `alias` (6-character alphanumeric string, e.g. `"abc123"`). Retry on collision.
- Building `transformedUrl` as `"{APP_DOMAIN}/{alias}"`.
- Setting `clicks` to `0`.
- Setting `createdAt` to the current UTC timestamp.
- Setting `status` to `"Active"`.
- Persisting the record to the database.

```json
{
  "id": "a1b2c3d4-...",
  "originalUrl": "https://example.com/very/long/path",
  "transformedUrl": "https://shorty.app/abc123",
  "alias": "abc123",
  "transformationType": "Shorten",
  "clicks": 0,
  "createdAt": "2026-06-01T18:00:00.000Z",
  "status": "Active"
}
```

---

### 4.3 Delete a URL

```
DELETE /api/urls/{id}
```

Permanently removes the URL record from the database.

**Response — 204 No Content**

Empty body. No JSON.

**Response — 404 Not Found**

```json
{ "error": "URL not found" }
```

---

## 5. Redirect Handler

This is not an API endpoint — it is a server-side route that handles short URL resolution.

```
GET /{alias}
```

**Behavior (in order):**

1. Look up the URL record by `alias`.
2. If found: increment `clicks` by 1, then respond with **302 Found** redirecting to `originalUrl`.  
   Use `302` (temporary), not `301` (permanent), so browsers do not cache the redirect and click counts remain accurate.
3. If not found: respond with **404 Not Found**.

The frontend never calls this route directly — it is triggered by the user visiting the short URL in their browser.

---

## 6. Error Handling

All error responses must use this format, regardless of status code:

```json
{ "error": "<human-readable message describing what went wrong>" }
```

Expected HTTP status codes:

| Scenario | Status |
|---|---|
| Invalid request body (missing field, bad URL format) | 400 |
| Record not found by ID or alias | 404 |
| Alias collision could not be resolved after retries | 500 |
| Unexpected server error | 500 |

---

## 7. Development Setup Note

The frontend Vite dev server currently has no proxy configured. The Flask server needs to run on a known local port (e.g. `5000`). The frontend `vite.config.ts` will need a proxy entry pointing `/api` and any `/{alias}` routes to that port before integration testing can begin.

---

## 8. Out of Scope

The following were explicitly excluded from this integration and should not be implemented:

- Authentication / user accounts
- Custom aliases (user-defined)
- URL archiving
- Click analytics beyond a total count
- Pagination
- Growth statistics
- "Clean" URL transformation type
