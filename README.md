# TokenVesting

A **token vesting smart contract** on **Stellar Soroban** with cliff periods, linear release schedules, and revocable grants — complete with a full-stack **Next.js** dashboard for managing vesting schedules.

## Overview

TokenVesting allows an admin to create vesting grants for beneficiaries. Each grant defines a token, amount, start time, cliff period, and total duration. Beneficiaries can release vested tokens after the cliff, and the admin can revoke revocable grants (sending the vested portion to the beneficiary and returning the remainder to the admin).

### Features

- **Cliff-based vesting** — Tokens are locked until the cliff timestamp
- **Linear release** — After the cliff, tokens vest continuously over the duration
- **Revocable grants** — Admin can revoke grants, sending vested tokens to the beneficiary
- **Full frontend** — Next.js dashboard with wallet integration (Freighter, xBull, Lobstr, Albedo, WalletConnect)
- **Real-time updates** — Transaction tracking, event feed, grant list polling
- **Dark mode UI** — Custom components with responsive design

## Contract

**Deployed address (Testnet):**

```
CDYUT22J2WTVBSVHZGXBUYU4OGR6ZWVDAPCOD4HEUS5QPKUXV44OPYU3
```

### Contract Interface

| Method | Description | Auth |
|---|---|---|
| `initialize(admin)` | Set the contract admin | — |
| `create_grant(admin, token, beneficiary, amount, start, cliff, duration, revocable)` | Create a new vesting grant | `admin` |
| `release(caller, grant_id)` | Release vested tokens to beneficiary | `caller` |
| `revoke(admin, grant_id)` | Revoke a grant (vested → beneficiary, rest → admin) | `admin` |
| `get_grant(grant_id)` | Get grant details | — |
| `get_releasable(grant_id)` | Get currently releasable amount | — |
| `get_grant_count()` | Get total number of grants | — |

## Tech Stack

- **Smart Contract**: Rust + Soroban SDK v25
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4
- **State**: Zustand, TanStack Query
- **Wallet**: StellarWalletsKit v2.4.0
- **Blockchain**: @stellar/stellar-sdk v16

## Project Structure

```
project/
├── contract/          # Soroban smart contract (Rust)
│   └── contracts/contract/src/
│       ├── lib.rs     # Contract implementation
│       └── test.rs    # Test suite (10 tests)
├── client/            # Next.js frontend
│   ├── src/
│   │   ├── app/       # Pages (Home, Dashboard, Activity, Transactions)
│   │   ├── components/ui/  # Custom UI components
│   │   ├── hooks/     # Contract interaction hooks
│   │   ├── lib/       # Wallet & utility functions
│   │   ├── store/     # Zustand global state
│   │   └── types/     # TypeScript type definitions
│   ├── packages/contract/  # Generated typed contract bindings
│   └── scripts/       # Deployment scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- [Freighter wallet](https://freighter.app) (browser extension)
- Testnet funds from [Stellar Lab](https://laboratory.stellar.org/#account-creator?network=testnet)

### Install & Run

```bash
cd client
cp .env.example .env.local  # adjust if needed
bun install
bun run dev
```

Open [http://localhost:3000](https://preview-9001-morphvm-zdheb0ev.http.cloud.morph.so), connect your Freighter wallet, and start creating vesting grants.

## Development

### Build Contract

```bash
cd contract
stellar contract build
cargo test
```

### Deploy

```bash
stellar keys generate dev --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32v1-none/release/contract.wasm \
  --source-account dev --network testnet
```
