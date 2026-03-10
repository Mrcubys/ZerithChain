# ZenithScan — Standalone Block Explorer

ZenithScan adalah block explorer mandiri untuk Zerith Chain, dirancang untuk di-deploy di domain terpisah dari Zerith Wallet.

## Quick Start

### 1. Buat Repl baru di Replit
- Pilih template **Node.js** atau **Static Site**
- Upload / copy seluruh isi folder `zenithscan-standalone/` ke Repl baru tersebut

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables
Di Replit Secrets / `.env`, set:
```
VITE_API_BASE_URL=https://your-zerith-wallet.replit.app
VITE_WALLET_URL=https://your-zerith-wallet.replit.app
```
- `VITE_API_BASE_URL` — URL Zerith Wallet yang sudah di-deploy (sumber data blockchain)
- `VITE_WALLET_URL` — URL yang sama, untuk tombol "Wallet" di header ZenithScan

### 4. Jalankan (development)
```bash
npm run dev
```

### 5. Deploy ke Replit
- Klik **Deploy** di Replit
- ZenithScan akan live di domain baru, misalnya `zenithscan.replit.app`

## Routes

| Path | Halaman |
|------|---------|
| `/` | Halaman utama: search + stats + tabel blok & transaksi terbaru |
| `/blocks` | Daftar semua blok |
| `/txs` | Daftar semua transaksi |
| `/tx/:hash` | Detail transaksi |
| `/block/:height` | Detail blok |
| `/address/:address` | Detail alamat / wallet |
| `/validators` | Daftar validator |

## Koneksi ke Zerith Wallet

ZenithScan mengambil data dari API Zerith Wallet melalui `VITE_API_BASE_URL`. Zerith Wallet backend sudah dikonfigurasi untuk mengizinkan permintaan CORS dari domain luar, sehingga tidak perlu konfigurasi tambahan di server.

API yang digunakan:
- `GET /api/blocks`
- `GET /api/transactions`
- `GET /api/blocks/:identifier`
- `GET /api/transactions/:hash`
- `GET /api/addresses/:address`
- `GET /api/validators`
- `GET /api/network/status`
