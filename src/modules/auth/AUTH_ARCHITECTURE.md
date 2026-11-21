
# SIGMS Authentication Architecture

## Authentication methods
- Email or username and password.
- JWT access tokens.
- JWT refresh tokens.
- Secure password hashing.
- Token refresh and revocation.

## Token strategy
- Access token: short-lived, 15 minutes.
- Refresh token: longer-lived, 7 days.
- Refresh tokens are stored securely as hashes.
- Revoked and expired tokens cannot be reused.

## Authorization
- Role-based access control (RBAC).
- Permission-based authorization.
- School membership validation.
- School tenant isolation.

## Supported roles
1. SUPER_ADMIN
2. SCHOOL_ADMIN
3. PRINCIPAL
4. VICE_PRINCIPAL
5. REGISTRAR
6. TEACHER
7. STUDENT
8. PARENT

## Client authentication
- Web: secure HTTP-only cookies.
- Mobile: secure token storage and bearer authentication.
- All clients communicate through the backend REST API.

## Security requirements
- Password hashing.
- Login rate limiting.
- Session management.
- Token rotation.
- Account activation and deactivation.
- Authentication audit logging.
