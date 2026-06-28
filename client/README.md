# TokenVesting - Stellar Soroban

A token vesting platform on Stellar Soroban with cliff periods, linear release schedules, and revocable grants.

## Features

- **Cliff Periods** — Set a cliff duration before any tokens become vested
- **Linear Release** — Tokens vest linearly over the specified duration
- **Revocable Grants** — Admin can revoke grants, sending vested tokens to beneficiary and remainder back to admin
- **Multi-Wallet** — Supports Freighter, xBull, Lobstr, Albedo, and WalletConnect
- **Real-Time Updates** — Automatic polling for grant state changes and events
- **Activity Feed** — Track contract interactions in real-time
- **Transaction History** — View status of all submitted transactions

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Bun](https://bun.sh/) (recommended) or npm
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup) (for contract deployment)
- [Freighter Wallet](https://freighter.app/) browser extension

## Getting Started

### 1. Install Dependencies

```bash
cd client
bun install
```

### 2. Deploy the Contract

```bash
# Build the contract
cd ../contract
stellar contract build

# Generate and fund a deployer key
stellar keys generate deployer --network testnet --fund

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello-world.wasm \
  --source-account deployer \
  --network testnet
```

Or use the deployment script:

```bash
cd ../client
export DEPLOYER_SECRET_KEY=<your-secret-key>
bun run scripts/deploy.ts
```

### 3. Configure Environment

```bash
cp .env.example .env.local
# Update NEXT_PUBLIC_CONTRACT_ID with your deployed contract address
```

### 4. Initialize the Contract

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account deployer \
  --network testnet \
  -- \
  initialize \
  --admin <DEPLOYER_PUBLIC_KEY>
```

### 5. Run the Frontend

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Architecture

```
client/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── dashboard/    # Main vesting dashboard
│   │   ├── activity/     # Activity feed
│   │   └── transactions/ # Transaction history
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI primitives
│   │   ├── Navbar.tsx    # Navigation + wallet
│   │   ├── WalletModal.tsx
│   │   ├── CreateGrantForm.tsx
│   │   ├── GrantCard.tsx
│   │   └── VestingDashboard.tsx
│   ├── hooks/            # TanStack Query hooks
│   ├── lib/              # Wallet + utilities
│   ├── store/            # Zustand global state
│   ├── contracts/        # Contract configuration
│   └── types/            # TypeScript definitions
├── scripts/
│   └── deploy.ts         # Contract deployment script
├── packages/
│   └── contract/         # Generated contract bindings
└── package.json
```

## Contract Interface

| Function | Description | Auth |
|---|---|---|
| `initialize(admin)` | Set contract admin | — |
| `create_grant(admin, token, beneficiary, amount, start, cliff, duration, revocable)` | Create new vesting grant | admin |
| `release(caller, grant_id)` | Release vested tokens | beneficiary |
| `revoke(admin, grant_id)` | Revoke a grant | admin |
| `get_grant(grant_id)` | View grant details | — |
| `get_releasable(grant_id)` | Check releasable amount | — |
| `get_grant_count()` | Total grants created | — |

## Tech Stack

- **Blockchain**: Stellar Soroban (Smart Contracts)
- **Frontend**: Next.js 16, React 19, TypeScript
- **State**: TanStack Query, Zustand
- **Wallet**: StellarWalletsKit (Freighter, xBull, Lobstr, Albedo, WalletConnect)
- **Styling**: Tailwind CSS v4
- **SDK**: @stellar/stellar-sdk v16
