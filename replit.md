# Zerith Chain

A complete Layer-1 blockchain project featuring an interactive web wallet (Zerith Wallet) and live block explorer (ZenithScan), built as a full-stack React + Express application.

## Overview

Zerith Chain is a simulated Layer-1 blockchain ecosystem with:
- **Zerith Wallet**: Create/import wallets, send/receive ZTH tokens, network switching, staking
- **ZenithScan Explorer**: Real-time block and transaction explorer with search
- **Validator Network**: View the global validator network with ZPoS consensus
- **Transaction History**: Filterable list of all wallet transactions
- **Technical Whitepaper**: Full professional whitepaper for the project

## Architecture

- **Frontend**: React + Vite + TailwindCSS + shadcn/ui components
- **Backend**: Express.js with in-memory blockchain simulation
- **Routing**: wouter for client-side routing
- **State**: TanStack Query for server state management
- **Theme**: Light mode (white/light-blue OKX style) by default, dark mode toggle in Settings

## Navigation

**4-tab layout:**
- **Desktop**: Left sidebar (256px) with Zerith Wallet logo + 4 nav items
- **Mobile**: Fixed bottom navigation bar with 4 icons

**Tabs:**
1. Wallet (`/`) — Asset balance, QR code, Send/Receive, recent activity
2. History (`/history`) — Transaction history with filters
3. Browser (`/explorer`, `/validators`, `/stake`, `/whitepaper`) — Explorer with sub-tabs
4. Settings (`/settings`) — Network, theme, wallet management

## Key Routes

- `/` — Zerith Wallet (create/import/manage + asset dashboard)
- `/wallet/send` — Send ZTH transactions
- `/wallet/receive` — Receive ZTH with QR code
- `/history` — Transaction history (filterable, paginated)
- `/explorer` — Block explorer (blocks + transactions tabs, default Browser tab)
- `/explorer/block/:identifier` — Block detail page
- `/explorer/tx/:hash` — Transaction detail page
- `/explorer/address/:address` — Address detail page
- `/validators` — Global validator network (Browser sub-tab)
- `/stake` — Staking interface with validator list (Browser sub-tab)
- `/whitepaper` — Technical whitepaper (Browser sub-tab)
- `/settings` — Settings (network, theme, wallet disconnect)

## API Endpoints

- `GET /api/network/status?network=mainnet|testnet` — Network statistics
- `GET /api/blocks?limit=N` — Latest blocks
- `GET /api/blocks/:identifier` — Block by height or hash
- `GET /api/transactions?limit=N` — Latest transactions
- `GET /api/transactions/:hash` — Transaction detail
- `GET /api/address/:address` — Address info + transactions
- `GET /api/validators` — All validators
- `GET /api/wallet?address=...&network=...` — Wallet data + transactions
- `POST /api/wallet/send` — Submit transaction
- `GET /api/search?q=query` — Universal search
- `GET /api/genesis` — Genesis wallet list

## Design

- **Light theme** by default: white background, light-blue (#5AC8FA ≈ HSL 197 90% 52%) accent
- **Card backgrounds**: very light blue (#F0FAFF area)
- **Font**: Inter (body), rounded corners (0.625rem radius)
- Responsive layout — sidebar on desktop, bottom nav on mobile
- Live network stats auto-refresh every 3-5 seconds

## Wallet System

- **Genesis/developer wallets**: 3 pre-seeded wallets with large ZTH balances (10M, 50M, 100M)
- **Demo wallet**: `zth1dev0000000000000000000000000000000000` — 10M ZTH, loads via one-click
- **Regular wallets**: Start at 0 ZTH, create with seed phrase generation or import
- Network persisted in localStorage (`zerith-network`)
- Wallet address persisted in localStorage (`zerith-wallet-address`)
