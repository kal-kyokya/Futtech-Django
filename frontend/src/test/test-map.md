# Auth Test Map

## Registration
- **Email already used (400)**: verifies the email field error is rendered and the form returns to the email step.
- **Password too short (400)**: verifies password field error rendering and submit button disables during request.
- **Non-field erros (400)**: verifies the general error banner surfaces API-provided messages.

## Login
- **Invalid credentials (401)**: verifies the error message is displayed and the user remains on the sign-in screen.
- **Server failure (500)**: verifies the server-provided message appears in the UI.
- **Login success**: ensures that the access token is stored and shows the user afyer successful login.

## Logout
- **Logout failure (500)**: verifies local auth state clears and the login notice is shown even if the API fails.

## Auth persistence + /me
- **/me success**: verifies persisted session fetch renders current user.
- **/me unauthorized (401)**: verifies token is cleared and the UI redirects to login.