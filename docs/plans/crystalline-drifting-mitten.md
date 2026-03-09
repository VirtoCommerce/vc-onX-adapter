# Plan: Enrich createSalesOrder with prices, default address, and payment

## Context

When creating an order via `createSalesOrder`, the adapter currently requires the client (AI agent) to provide product prices, shipping address, and doesn't create a payment document at all. This forces the AI to make extra tool calls and guess at data that VirtoCommerce already knows. The goal is to auto-enrich the order with:

1. **Product prices** from VirtoCommerce Pricing module
2. **Customer's default shipping address** from their Contact record
3. **A default payment document** (manual/cash) so the order is complete

All enrichment is fallback-only — input-provided values always take precedence.

## Changes

### 1. Add pricing models — `src/models/catalog.ts` + `src/models/index.ts`

Add `PriceEvaluationContext` and `EvaluatedPrice` interfaces:

```typescript
export interface PriceEvaluationContext {
  storeId?: string;
  catalogId?: string;
  productIds?: string[];
  currency?: string;
  customerId?: string;
  quantity?: number;
}

export interface EvaluatedPrice {
  productId?: string;
  list?: number;
  sale?: number | null;
  currency?: string;
  minQuantity?: number;
}
```

Export both from `src/models/index.ts`.

### 2. Expand `resolveSkuProductMap` — `src/services/product.service.ts`

- Add `storeId?: string` field and `setStoreId()` method (same pattern as `catalogId`)
- Change return type: `Map<string, { id: string; name: string }>` → `Map<string, { id: string; name: string; price?: number }>`
- Add optional `options` parameter: `{ currency?: string; customerId?: string }`
- After existing catalog search, call `POST /api/pricing/evaluate` with resolved product IDs
- Pick effective price: `sale ?? list`
- Pricing failures are non-fatal — proceed without prices

### 3. Wire `storeId` to ProductService — `src/adapter.ts`

Call `productService.setStoreId(this.options.workspace)` where `setCatalogId` is already called.

### 4. Enrich order in OrderService — `src/services/order.service.ts`

In `createSalesOrder()`, after customer enrichment block (line 70-79):

**a) Extract default addresses from Contact:**
- Already have `contact` from `getCustomerById()`. Use it to find default shipping/billing address.
- Match by `contact.defaultShippingAddressId` against `address.key`, fallback to `addressType` match.
- Store as VirtoCommerce `Address` objects (no conversion needed — they go directly into the payload).

**b) Pass pricing context to `resolveSkuProductMap`:**
```typescript
await this.productService.resolveSkuProductMap(skus, {
  currency: input.order?.currency ?? 'USD',
  customerId,
})
```

**c) Pass enrichment data to transformer:**
```typescript
this.transformer.fromCreateSalesOrderInput(input, skuProductMap, {
  defaultShippingAddress,
  defaultBillingAddress,
})
```

### 5. Update transformer — `src/transformers/order.transformer.ts`

**a) New optional parameter** on `fromCreateSalesOrderInput`:
```typescript
interface CreateOrderEnrichment {
  defaultShippingAddress?: VirtoAddress;
  defaultBillingAddress?: VirtoAddress;
}
```

**b) Price fallback** on line items:
```typescript
const unitPrice = item.unitPrice ?? resolved?.price ?? 0;
```

**c) Address fallback**: If `order.shippingAddress` is not provided, use `enrichment.defaultShippingAddress` directly (it's already a VirtoCommerce Address). Same for billing.

**d) Build `PaymentIn` document**:
```typescript
const payment: PaymentIn = {
  currency,
  price: orderTotal,
  sum: orderTotal,
  paymentStatus: 'New',
  gatewayCode: 'DefaultManualPaymentMethod',
  paymentMethod: {
    code: 'DefaultManualPaymentMethod',
    name: 'Manual Payment',
    paymentMethodType: 0,
    isActive: true,
  },
  billingAddress,
  customerId: order.customer?.id ?? order.customer?.externalId,
  customerName,
  objectType: 'PaymentIn',
};
```

Add `inPayments: [payment]` to the returned `CustomerOrder`.

**e) Import** `PaymentIn` type from models.

### 6. Update tests — `tests/adapter.test.ts`

- Existing `createSalesOrder` tests: add mock for `GET /api/members/{id}` (returning Contact with addresses) and `POST /api/pricing/evaluate` (returning prices). Update mock ordering (the pricing call is a new POST between catalog search and order creation).
- New test: `should use customer default address when not provided in input`
- New test: `should use resolved prices when unitPrice not provided`
- New test: `should include payment document in order payload`
- Verify payment structure in existing tests.

## File summary

| File | Change |
|------|--------|
| `src/models/catalog.ts` | Add `PriceEvaluationContext`, `EvaluatedPrice` |
| `src/models/index.ts` | Export new types |
| `src/services/product.service.ts` | Add `storeId`, expand `resolveSkuProductMap` with pricing call |
| `src/adapter.ts` | Wire `storeId` to ProductService |
| `src/services/order.service.ts` | Extract default addresses from Contact, pass pricing options and enrichment |
| `src/transformers/order.transformer.ts` | Accept enrichment, price fallback, address defaults, build PaymentIn |
| `tests/adapter.test.ts` | Update mocks, add new test cases |

## Verification

1. `npx tsc --noEmit` — typecheck passes
2. `npm test` — all existing + new tests pass
3. Manual: mock order creation should include resolved prices, customer address, and payment in API payload
