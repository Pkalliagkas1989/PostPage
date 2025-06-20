# Postpage Forum

This repository contains a Go backend API and a simple static user interface served via the `ui` module.

The JavaScript-based frontend has been removed to simplify the project. The HTML templates now submit forms directly to the API endpoints.

Run the API and UI servers with Docker Compose:

```bash
docker compose up --build
```

## Error Handling

The API exposes an `/forum/api/error` endpoint that can be used to simulate
different HTTP error responses. Supply the desired status code through the `code`
query parameter:

```bash
curl http://localhost:8080/forum/api/error?code=404
```

Common codes that the application returns and their meaning include:

| Code | Meaning | When it occurs |
|------|---------|---------------|
| 400  | Bad Request | Invalid or malformed data in a request, such as missing required fields. |
| 401  | Unauthorized | Authentication is required or the session is invalid. |
| 403  | Forbidden | The CSRF token is missing or does not match. |
| 404  | Not Found | Requested resource cannot be located. |
| 405  | Method Not Allowed | The HTTP verb is not supported for the endpoint. |
| 409  | Conflict | A resource already exists (for example duplicate email or username). |
| 429  | Too Many Requests | Registration rate limits have been exceeded. |
| 500  | Internal Server Error | An unexpected error occurred on the server. |

To trigger a specific error manually, call the `/forum/api/error` endpoint with
the `code` parameter set to one of the values above. Optionally, pass a custom
message using the `message` query parameter:

```bash
curl "http://localhost:8080/forum/api/error?code=400&message=bad+data"
```

## JavaScript Helper

The UI scripts share a `fetchJSON` helper located at
`ui/static/js/api.js`. Import this function instead of calling
`fetch` directly:

```javascript
import { fetchJSON } from './api.js';

const data = await fetchJSON('http://localhost:8080/forum/api/allData', {
  credentials: 'include'
});
```

On success it returns the parsed JSON. When the response is not OK the
function attempts to parse an error object with `code` and `message`
and redirects the user to `/error?code=CODE&message=MESSAGE`.
