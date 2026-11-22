
# SIGMS API Conventions

## Base URL
/api/v1

## HTTP methods
- GET: Retrieve resources.
- POST: Create resources or perform actions.
- PUT: Replace resources.
- PATCH: Update resources.
- DELETE: Remove resources.

## Endpoint naming
- Use lowercase plural resource names.
- Use kebab-case for multiword resources.
- Use nested routes for related resources.

## Response structure
- success
- message
- data
- pagination (when applicable)

## Error responses
- success: false
- status
- message
- errors (when applicable)

## Versioning
- Current version: v1
- Future breaking changes require a new API version.
