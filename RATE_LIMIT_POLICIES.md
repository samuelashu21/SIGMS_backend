
# SIGMS Rate-Limit Policies

| Endpoint category | Window | Maximum requests |
|---|---:|---:|
| Login | 15 minutes | 5 |
| Password recovery | 15 minutes | 5 |
| Token refresh | 15 minutes | 30 |

## Behavior

- Rate limits are applied by client IP.
- Standard rate-limit headers are returned.
- Requests exceeding the limit receive HTTP 429.
- Login and password recovery use stricter limits.

## Deployment

For multi-instance production deployments, configure a shared
rate-limit store so limits are consistent across backend instances.




# SIGMS API Rate-Limit Policies

| Category | Window | Maximum |
|---|---:|---:|
| Global API | 15 minutes | 300 requests |
| Authentication | 15 minutes | 10 requests |
| Password recovery | 60 minutes | 5 requests |
| Sensitive operations | 60 seconds | 20 requests |

## Sensitive endpoints

Apply sensitiveOperationRateLimiter to:
- Bulk marks entry and updates
- Bulk attendance operations
- Report and document exports
- Administrative actions

## Deployment

The default in-memory limiter is suitable for a single backend instance.
For multiple instances, configure a shared Redis-compatible rate-limit store.
IP-based limits should not be the only protection for sensitive operations.
