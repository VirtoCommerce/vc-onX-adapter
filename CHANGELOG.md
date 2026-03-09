# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.0.1-alpha.2] - 2025-03-09

### Added
- VirtoCommerce adapter implementing `IFulfillmentAdapter` interface
- Order operations: `createSalesOrder`, `cancelOrder`, `updateOrder`, `getOrders`
- Fulfillment operations: `fulfillOrder`, `getFulfillments`
- Customer operations: `getCustomers`
- Product operations: `getProducts`, `getProductVariants`
- Inventory operations: `getInventory`
- Return operations: `createReturn`, `getReturns`
- Bidirectional status mapping (VirtoCommerce PascalCase <-> MCP lowercase)
- Country-aware address transformation
- Customer enrichment during order retrieval
- SKU-to-product resolution with pricing evaluation
- Exponential backoff retry with Retry-After header support
- Documentation: API reference, configuration, permissions, quick start, limitations
