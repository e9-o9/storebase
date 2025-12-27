# Marketplace Channel Management

This feature extends the Chatbase dashboard to support a marketplace/multi-tenant architecture where AI agents (chatbots) can be assigned to specific stores as channels.

## Overview

The marketplace channel management system enables:

1. **Store Management**: Create and manage multiple stores (e.g., Shopify, WooCommerce, Magento)
2. **Channel Assignment**: Assign AI agents to specific stores as communication channels
3. **Multi-tenant Support**: Support multiple stores using the same chatbot platform with proper isolation

## Database Schema

### Stores Table

The `stores` table represents individual stores/shops in the marketplace.

### Agent-Store Channels Table

The `agentStoreChannels` table maps agents to stores.

## Usage Example

1. **Create a Store**
   - Navigate to `/stores`
   - Click "New Store"
   - Fill in store details (name, domain, store type, etc.)

2. **Assign an Agent to a Store**
   - Navigate to an agent or store
   - Use the channel management interface
   - Select and assign agents/stores

## Benefits

1. **Scalability**: Support multiple stores from a single chatbot management platform
2. **Flexibility**: Assign agents to multiple stores or use different agents for different stores
3. **Control**: Enable/disable agents per store without affecting other stores
4. **Marketplace Ready**: Built on the Shopify marketplace concept for easy integration
