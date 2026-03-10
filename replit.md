# Zerith Chain

A complete Layer-1 blockchain project featuring an interactive web wallet (Zerith Wallet) and live block explorer (ZenithScan), built as a full-stack React + Express application.

## Overview

Zerith Chain is a simulated Layer-1 blockchain ecosystem with:
- **Web Wallet**: Create/import wallets, send/receive ZTH tokens, network switching
- **ZenithScan Explorer**: Real-time block and transaction explorer with search
- **Validator Network**: View the global validator network with ZPoS consensus
- **Technical Whitepaper**: Full professional whitepaper for the project

## Architecture

- **Frontend**: React + Vite + TailwindCSS + shadcn/ui components
- **Backend**: Express.js with in-memory blockchain simulation
- **Routing**: wouter for client-side routing
- **State**: TanStack Query for server state management
- **Theme**: Dark mode by default (toggle available), neon blue/cyan/purple accents

## Key Routes

- `/` - Dashboard (network stats + latest blocks/transactions)
- `/wallet` - Zerith Wallet (create/import/manage)
- `/wallet/send` - Send ZTH transactions
- `/wallet/receive` - Receive ZTH with QR code
- `/explorer` - Block explorer (blocks + transactions tabs)
- `/explorer/block/:identifier` - Block detail page
- `/explorer/tx/:hash` - Transaction detail page
- `/explorer/address/:address` - Address detail page
- `/validators` - Global validator network
- `/whitepaper` - Technical whitepaper

## API Endpoints

- `GET /api/network/status?network=mainnet|testnet` - Network statistics
- `GET /api/blocks?limit=N` - Latest blocks
- `GET /api/blocks/:identifier` - Block by height or hash
- `GET /api/transactions?limit=N` - Latest transactions
- `GET /api/transactions/:hash` - Transaction detail
- `GET /api/address/:address` - Address info + transactions
- `GET /api/validators` - All validators
- `GET /api/wallet/:address?network=N` - Wallet data
- `POST /api/wallet/send` - Submit transaction
- `GET /api/search?q=query` - Universal search

## Design

- Dark theme by default (persisted to localStorage)
- Neon color accents: blue (#3B82F6), cyan (#06B6D4), purple (#8B5CF6), green (#22C55E)
- Font: Oxanium for display/headings, Open Sans for body
- Responsive layout with collapsible sidebar
- Live network stats auto-refresh every 3-5 seconds
