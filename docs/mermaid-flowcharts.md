# Registration Flowchart (Client ⇄ Server ⇄ Client)

```mermaid
flowchart TD
	  A[User submits registration form in UI] --> B[AuthService.register posts user data]
	  B --> C[apiClient POST /auth/register/ with user data]
	  C --> D[Backend UserRegistrationView validates input]
	  D --> E{Registration valid?}
	  E -- No --> F[Return 400/validation error]
	  F --> G[apiClient normalizes error]
	  G --> H[Registration UI shows error state]

	  E -- Yes --> I[Create user + issue JWT access token]
	  I --> J[Set refresh_token HttpOnly cookie]
	  J --> K[Return response with access token + user payload]
	  K --> L[AuthService stores access token in tokenService]
	  L --> M[AuthService fetches initial content]
	  M --> N[Registration success state in UI]
```

## Key Components

- **Frontend**
  - `AuthService.register` sends the registration request, stores the access token, and triggers initial content fetches success.
  - `apiClient` configures Axios with credentials and handles responses/errors.
- **Backend**
  - `UserRegistrationView` validates input, creates the user, issues the access token, and sets the refresh token as an HttpOnly cookie.

## Notes

- Refresh tokens are stored as HttpOnly cookies and scoped to `/api/v2/auth/`.
- Access tokens are kept client-side in the token service and attached to future API requests.

# Login Flowchart (Client ⇄ Server ⇄ Client)

```mermaid
flowchart TD
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

```mermaid
flowchart TD
	  A[App loads / refreshes] --> B[tokenService.rehydrate reads stored access token]
	  B --> C{Access token present?}
	  C -- No --> D[Redirect user to login]
	  C -- Yes --> E[apiClient attaches Bearer token to requests]
	  E --> F[Request protected resource]
	  F --> G{Backend returns 401?}
	  G -- No --> H[Request succeeds]
	  G -- Yes --> I[apiClient calls /auth/token/refresh]
	  I --> J{Refresh token cookie valid?}
	  J -- No --> K[Clear access token + redirect to login]
	  J -- Yes --> L[Issue new access token]
	  L --> M[tokenService updates access token]
	  M --> N[Retry original request]
```

## Key Components

- **Frontend**
  - `tokenService.rehydrate` restores access tokens on app load.
  - `apiClient` attaches access tokens to requests and handles automatic refresh on 401 responses.
- **Backend**
  - `RefreshTokenCookieView` issues a new access token when a valid refresh token cookie is present.

## Notes

- Refresh tokens are stored as HttpOnly cookies and scoped to `/api/v2/auth/`.
- Access tokens are stored client-side and refreshed automatically when expired.

# Logout Flowchart (Client ⇄ Server ⇄ Client)

```mermaid
flowchart TD
	  A[User initiates logout in UI] --> B[AuthService.logout posts logout request]
	  B --> C[apiClient POST /auth/logout/]
	  C --> D[Backend LogoutView reads refresh token]
	  D --> E{Refresh token present/valid?}
	  E -- No or invalid --> F[Return 400 + delete refresh cookie]
	  F --> G[Logout UI shows error or clears state]

	  E -- Yes --> H[Blacklist refresh token]
	  H --> I[Delete refresh_token HttpOnly cookie]
	  I --> J[Return 204 No Content]
	  J --> K[Client clears access token + auth state]
	  K --> L[Redirect to login]
```

## Key Components

- **Frontend**
  - `AuthService.logout` sends the logout request and reports success or failure.
  - `apiClient` includes credentials to send the refresh token cookie.
  - Client-side logout handlers clears access tokens and redirect to `/login`.
- **Backend**
  - `LogoutView` reads the refresh token from the request body or cookie, blacklists it when valid, and deletes the refresh cookie.

## Notes

- Refresh tokens are stored as HttpOnly cookies and scoped to `/api/v2/auth`.
- Access tokens are cleared client-side on logout success or failure to prevent reuse.
