# Payment Service - Architectural Spec

Another real-world example showing payment processing with resilience.

## Component Name
Payment Processing Service

## Overview
Reliably charges users, handles failures, retries safely.

## State Ownership

| State | Owner | Location |
|-------|-------|----------|
| Payment Receipt | Payment Service | PostgreSQL (authoritative) |
| Payment Status | Payment Service | Redis cache (5 min TTL) |
| Retry Count | Payment Service | In-memory (lost on restart, OK) |

## Failure Modes

| Failure | Recovery |
|---------|----------|
| Gateway timeout (5s) | Retry 3x with exponential backoff |
| Rate limit (429) | Queue and retry 1 hour later |
| Invalid card | Reject immediately, notify customer |
| Database down | Circuit breaker, fail fast |
| Idempotency check | Detect retry, return cached receipt |

## Observability

Log every charge with:
- amount, currency, customerId
- status (success/timeout/rejected/rate_limited)
- latency, retries_attempted
- error type if failed

Metrics:
- charge_count (total)
- charge_latency (p50, p95, p99)
- charge_errors (by type)
- retry_count (distribution)

Alerts:
- Error rate > 5% → P2
- Timeout rate > 2% → P2
- Circuit breaker open → P1

## Security

- Never log card numbers
- Encrypt receipts at rest
- HTTPS for all API calls
- Rotate API keys regularly
- Use idempotency keys to prevent double-charging

---

**Use this as a template for your payment processing spec.**
