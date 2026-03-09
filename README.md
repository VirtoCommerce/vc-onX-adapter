# @virtocommerce/mcp-onx

VirtoCommerce adapter for the Commerce Operations Foundation (COF) MCP Server. Connects VirtoCommerce Platform to AI assistants via the Model Context Protocol (MCP), enabling order management, customer lookup, product catalog, inventory, fulfillment, and returns operations.

## Supported Operations

| Category | Tools |
| -------- | ----- |
| **Orders** | `create-sales-order`, `update-order`, `cancel-order`, `get-orders` |
| **Fulfillment** | `fulfill-order`, `get-fulfillments` |
| **Customers** | `get-customers` |
| **Products** | `get-products`, `get-product-variants` |
| **Inventory** | `get-inventory` |
| **Returns** | `create-return`, `get-returns` |

## Quick Start

### Option A: Via npx (no local clone needed)

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "cof-mcp": {
      "command": "npx",
      "args": [
        "--package=@virtocommerce/cof-mcp",
        "--package=@virtocommerce/mcp-onx",
        "--yes",
        "cof-mcp"
      ],
      "env": {
        "ADAPTER_TYPE": "npm",
        "ADAPTER_PACKAGE": "@virtocommerce/mcp-onx",
        "ADAPTER_CONFIG": "{\"apiUrl\":\"https://your-vc-instance.com\",\"apiKey\":\"YOUR_API_KEY\",\"workspace\":\"your-store-id\"}",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Option B: From source

```bash
git clone https://github.com/VirtoCommerce/mcp-onx.git
cd mcp-onx

# Build server first (adapter depends on it)
cd server && npm install && npm run build && cd ..

# Build adapter
cd virtocommerce-adapter && npm install && npm run build && cd ..
```

Then add to Claude Desktop config:

```json
{
  "mcpServers": {
    "cof-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/server/dist/index.js"],
      "env": {
        "ADAPTER_TYPE": "local",
        "ADAPTER_PATH": "/absolute/path/to/virtocommerce-adapter/dist/index.js",
        "ADAPTER_CONFIG": "{\"apiUrl\":\"https://your-vc-instance.com\",\"apiKey\":\"YOUR_API_KEY\",\"workspace\":\"your-store-id\"}",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Configuration

| Option | Type | Required | Default | Description |
| ------ | ---- | -------- | ------- | ----------- |
| `apiUrl` | `string` | Yes | — | VirtoCommerce Platform URL |
| `apiKey` | `string` | Yes | — | API key (`api_key` header) |
| `workspace` | `string` | No | — | Store ID — scopes orders/shipments, auto-detects catalog |
| `catalogId` | `string` | No | — | Catalog ID for product searches (auto-detected from store if `workspace` is set) |
| `timeout` | `number` | No | `30000` | Request timeout in milliseconds |
| `retryAttempts` | `number` | No | `3` | Max retry attempts for failed requests |
| `debugMode` | `boolean` | No | `false` | Log all API requests/responses to stderr |

## VirtoCommerce Permissions

The adapter requires the following VirtoCommerce API permissions:

- **Order**: Read, Search, Create, Update
- **Shipment**: Search
- **Customer/Members**: Read, Search
- **Catalog**: Search
- **Inventory**: Search
- **Platform**: Read (countries list)
- **Store**: Read (when `workspace` is set)
- **Pricing**: Evaluate (optional — for automatic price lookup during order creation)

See [docs/PERMISSIONS.md](docs/PERMISSIONS.md) for detailed permission mappings.

## Documentation

- [Quick Start Guide](docs/QUICKSTART.md) — step-by-step setup with screenshots
- [Configuration Reference](docs/CONFIGURATION.md) — all options, environment variables, retry logic
- [API Reference](docs/API.md) — endpoint mappings, status maps, filter/search mappings
- [Permissions](docs/PERMISSIONS.md) — required VirtoCommerce permissions per operation
- [Known Limitations](docs/LIMITATIONS.md) — unimplemented features and workarounds

## Development

```bash
cd virtocommerce-adapter

npm run build        # tsc → dist/
npm run dev          # tsc --watch
npm test             # Jest with --experimental-vm-modules
npm run lint         # ESLint
```

> **Note**: Build the server (`cd server && npm run build`) before building the adapter — it depends on `@cof-org/mcp` via `file:../server`.

## License

See [LICENSE](../LICENSE) in the repository root.
