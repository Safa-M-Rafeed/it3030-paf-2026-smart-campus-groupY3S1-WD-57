# Smart Campus API Postman Testing

## Files

- Collection: files/postman/SmartCampus.postman_collection.json
- Environment: files/postman/SmartCampus.local.postman_environment.json

## Before Running

1. Start backend at `http://localhost:8081`.
2. Ensure PostgreSQL is running and matches `application.yml`.
3. Import both files into Postman.
4. Select the `SmartCampus Local` environment.
5. Set variables:
   - `jwtToken`: any authenticated user token.
   - `adminJwtToken`: token for ADMIN user.

## How To Get JWT Token

This project issues JWT after Google OAuth success and redirects to frontend callback with:

- `/auth/callback?token=<JWT>`

Use the token value as `jwtToken`.
Use an ADMIN account token as `adminJwtToken` for admin endpoints.

## What Is Tested

- Public health and resources endpoint access.
- Full resource CRUD flow with variable chaining (`resourceId`).
- Auth enforcement on protected endpoints.
- User-level authenticated endpoints.
- Admin-only endpoints (`/api/users`, analytics, audit trail).

## Optional CLI Run With Newman

```powershell
npx newman run files/postman/SmartCampus.postman_collection.json -e files/postman/SmartCampus.local.postman_environment.json
```

