# Login Flowchart (Client ⇄ Server ⇄ Client)

```mermaid
flowchart LR
	  A[User submits email/password in login UI] --> B[AuthService.login posts credentials]
	  B --> C[apiClient POST /auth/login/ with credentials]
	  C --> D[Backend ObtainCookieView validates credentials]
	  D --> E{Credentials valid?}
	  E -- No --> F[Return 401/validation error]
	  F --> G[apiClient normalizes error]
	  G --> H[Login UI shows error state]

	  E -- Yes --> I[Issue JWT access token]
	  I --> J[Set refresh_token HttpOnly cookie]
	  J --> K[Return response with access token + user payload]
	  K --> L[AuthService stores access token in tokenService]
	  L --> M[AuthService fetches initial content]
	  M --> N[Login success state in UI]
```

## Key Components

- **Frontend**
  - `AuthService.login` sends the login request, stores the access token, and triggers initial content fetches after success.
  - `apiClient` configures Axios with credentials and handles responses/errors.
- **Backend**
  - `ObtainTokenCookieView` validates credentials, issues the access token, and sets the refresh token as an HttpOnly cookie.

## Notes

- Refresh tokens are stored as HttpOnly cookies and scoped to `/api/v2/auth/`.
- Access tokens are kept client-side in the token service and attached to future API requests.

# Auth Persistence Flowchart (Client ⇄ Server ⇄ Client)