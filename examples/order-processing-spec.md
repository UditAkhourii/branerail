# Order Processing Service - Architectural Spec

Based on spec_template.md. Real-world example.

## Component Name
Order Processing Service

## Overview
Processes customer orders, handles payment, manages order state.

## Purpose and Scope
- Accept order from customer
- Validate inventory
- Process payment
- Queue notification
- Track order state

## Data Model

### Inputs
```
POST /orders
{
  "customerId": "CUST-123",
  "items": [
    {"productId": "PROD-456", "quantity": 2}
  ],
  "shippingAddress": "...",
  "billingAddress": "..."
}
```

### Outputs
```
{
  "orderId": "ORD-2026-04-27-001",
  "status": "PENDING",
  "total": 99.99,
  "estimatedDelivery": "2026-05-02"
}
```

## State Ownership

| State | Owner | Type | Location | Authority |
|-------|-------|------|----------|-----------|
| Order Status | Order Service | enum (PENDING, COMPLETED, FAILED) | Database | Single source of truth |
| Payment Receipt | Payment Service | JSON object | Database | Single source of truth |
| Inventory Reserve | Inventory Service | integer | Database | Single source of truth |
| Notification Queue | Message Queue | JSON events | Durable queue | Append-only log |

## Critical Paths

### Happy Path (Success)
1. Validate order (2ms)
2. Reserve inventory (10ms)
3. Process payment (2000ms)
4. Update order status to COMPLETED (5ms)
5. Queue notification (3ms)
6. Return order ID to customer (1ms)

**Total: ~2020ms (target: p99 < 5s)**

### Alternative Path (Inventory Error)
1. Validate order (2ms)
2. Check inventory → OUT OF STOCK (5ms)
3. Return error to customer (1ms)

**Total: ~8ms**

## Failure Modes

| Failure | Probability | Impact | Detection | Recovery |
|---------|-------------|--------|-----------|----------|
| Payment timeout | 2% | Order stuck PENDING | 5s timeout + log | Retry 3x exponential backoff |
| Inventory unavailable | 1% | Fail order immediately | Inventory API error | Return error, suggest alternatives |
| Database down | 0.1% | Cannot write state | Connection error | Circuit breaker, fail fast |
| Payment rejected | 3% | Payment failed | Payment API response | Notify customer, allow retry |
| Queue backlog | 0.5% | Notifications delayed | Queue depth > 5000 | Backpressure, scale workers |

## Observability

### Logging
```json
{
  "timestamp": "2026-04-27T10:30:45.123Z",
  "service": "order-processor",
  "operation": "create_order",
  "orderId": "ORD-2026-04-27-001",
  "customerId": "CUST-123",
  "status": "success",
  "latency_ms": 2100,
  "payment_latency_ms": 2000,
  "trace_id": "tr-abc123"
}
```

### Metrics
- orders_created (counter)
- order_latency (histogram: p50, p95, p99)
- payment_errors (counter: by type)
- inventory_failures (counter)

### Alerts
- Payment error rate > 5% for 5 min → P2
- Order latency p99 > 10s → P2
- Database connection lost → P1

## Dependencies

| Service | Endpoint | Timeout | Fallback | SLA |
|---------|----------|---------|----------|-----|
| Payment Gateway | stripe.com/v1/charges | 5s | Queue, retry later | 99.9% |
| Inventory Service | internal/inventory | 2s | Cached levels | 99.99% |
| User Service | internal/users | 2s | Cached profile | 99.99% |

## Testing Strategy

### Unit Tests
- Valid order creation
- Invalid input rejection
- State transitions

### Integration Tests
- End-to-end order flow
- Payment processing
- Inventory reservation

### Failure Mode Tests
- Payment timeout → retry
- Inventory error → reject gracefully
- Database error → fail fast

### Load Tests
- 100 orders/sec sustained
- 1000 concurrent orders
- Cache performance

## Scaling Plan

- **Month 1**: 100 orders/sec
- **Month 6**: 500 orders/sec → Add read replicas
- **Year 1**: 1000+ orders/sec → Shard by customer ID

## Questions Answered

### Where does state live?
Order Service is single owner of order status in PostgreSQL DB. Payment Service owns payment receipt. Inventory Service owns inventory levels. Cache is read-only replica of orders for performance.

### Where does feedback live?
Every operation logged to structured JSON sink. Metrics emitted: order count, latency percentiles, error rate by type. Alerts on error rate > 5% and latency p99 > 10s.

### What breaks if I delete this?
- If Order Service ↓: No orders can be created (critical)
- If Payment Service ↓: Orders queue, retry later (degraded, recoverable)
- If Cache ↓: Read directly from DB, slower but functional
- If Queue ↓: Notifications delayed, customers don't get emails (user-facing)

---

**This example shows how to fill out the spec_template.md with real data.**
