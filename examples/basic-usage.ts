/**
 * Basic Usage Example for VirtoCommerce Adapter
 *
 * Demonstrates direct programmatic usage of the adapter outside the MCP server.
 * In production, the MCP server invokes these methods via tool calls.
 */

import { VirtoCommerceFulfillmentAdapter } from '../src/adapter.js';

async function main() {
  const adapter = new VirtoCommerceFulfillmentAdapter({
    apiUrl: process.env.API_URL || 'https://your-vc-instance.com',
    apiKey: process.env.API_KEY || 'your-api-key',
    workspace: process.env.WORKSPACE || 'your-store-id',
    timeout: 30000,
    debugMode: true,
  });

  try {
    // 1. Connect (health check + load countries + store config)
    console.log('Connecting to VirtoCommerce...');
    await adapter.connect();
    console.log('Connected successfully\n');

    // 2. Health check
    const health = await adapter.healthCheck();
    console.log('Health:', health.status, '\n');

    // 3. Get orders
    console.log('Fetching recent orders...');
    const ordersResult = await adapter.getOrders({ pageSize: 5 });
    if (ordersResult.success) {
      console.log(`Found ${ordersResult.orders.length} orders`);
      for (const order of ordersResult.orders) {
        console.log(`  ${order.name} — ${order.status} — $${order.totalPrice}`);
      }
    }
    console.log('');

    // 4. Get customers
    console.log('Searching customers...');
    const customersResult = await adapter.getCustomers({
      emails: ['customer@example.com'],
    });
    if (customersResult.success) {
      console.log(`Found ${customersResult.customers.length} customers`);
    }
    console.log('');

    // 5. Create an order
    console.log('Creating order...');
    const createResult = await adapter.createSalesOrder({
      order: {
        customer: {
          id: 'CUSTOMER-ID',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        lineItems: [
          { sku: 'PRODUCT-SKU', quantity: 2, unitPrice: 29.99, name: 'Sample Product' },
        ],
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          stateOrProvince: 'NY',
          zipCodeOrPostalCode: '10001',
          country: 'US',
        },
        currency: 'USD',
      },
    });
    if (createResult.success) {
      console.log(`Order created: ${createResult.order.name} (${createResult.order.id})`);
    } else {
      console.log('Order creation failed:', createResult.message);
    }
    console.log('');

    // 6. Check inventory
    console.log('Checking inventory...');
    const inventoryResult = await adapter.getInventory({
      skus: ['PRODUCT-SKU'],
    });
    if (inventoryResult.success) {
      for (const item of inventoryResult.inventory) {
        console.log(`  ${item.sku}: ${item.availableQuantity} available at ${item.locationId}`);
      }
    }
    console.log('');

    // 7. Get products
    console.log('Fetching products...');
    const productsResult = await adapter.getProducts({ pageSize: 3 });
    if (productsResult.success) {
      for (const product of productsResult.products) {
        console.log(`  ${product.name} (${product.sku})`);
      }
    }

    // 8. Disconnect
    console.log('\nDisconnecting...');
    await adapter.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    try {
      await adapter.disconnect();
    } catch {
      // ignore disconnect errors
    }
    process.exit(1);
  }
}

main().catch(console.error);
