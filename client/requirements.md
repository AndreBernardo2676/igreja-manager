## Packages
date-fns | Date formatting and manipulation for UI

## Notes
The application expects the backend to expose endpoints exactly as defined in the provided `routes_manifest`.
Authentication is handled via session cookies (`credentials: "include"`).
Amounts in `/api/finances` are handled in cents by the API and converted to/from floating point values on the frontend.
