
# SIGMS API Response Conventions

## Successful response

{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}

## Created response

Use HTTP 201 for successfully created resources.

## Paginated response

{
  "success": true,
  "message": "Records retrieved successfully.",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

## Error response

{
  "success": false,
  "status": "fail",
  "message": "The requested operation failed."
}

## HTTP status codes

- 200: Successful request
- 201: Resource created
- 204: Successful request without response body
- 400: Invalid request
- 401: Authentication required
- 403: Permission denied
- 404: Resource not found
- 409: Resource conflict
- 422: Validation failure
- 429: Too many requests
- 500: Internal server error
