# Lesson Log

## Token Vesting Contract + Next.js Frontend

### Contract (lib.rs)
- Soroban SDK v25, no_std
- Contract: `TokenVesting` with `initialize`, `create_grant`, `release`, `revoke`, `get_grant`, `get_releasable`, `get_grant_count`
- Grant struct: token, beneficiary, amount, start, cliff, duration, released, revoked, revocable
- Vesting math: cliff check first, then linear `amount * elapsed / duration`, full at duration end
- `create_grant` transfers tokens from admin via `token::Client::new(&env, &token).transfer(&admin, &self_addr, &amount)`
- `release` sends vested - released tokens to beneficiary
- `revoke` sends vested to beneficiary, remainder to admin
- Events via `env.events().publish` for grant_created, released, revoked
- Storage: `instance` for Admin/GrantCount, `persistent` for individual Grant entries

### Tests (test.rs)
- 10 tests: initialize, create_grant, cliff_not_reached, partial_vesting, full_release, multiple_release, revoke_before_vesting, revoke_after_partial, revoke_non_revocable, events_emitted
- Use `env.register_stellar_asset_contract_v2(admin)` + `StellarAssetClient` for token operations
- `env.mock_all_auths()` + `Address::generate(&env)` pattern
- `env.ledger().set_timestamp(u64)` with `testutils::Ledger as _`
- `client.try_revoke(&admin, &grant_id)` for error testing (returns Result)

### Frontend
- Next.js 16 / React 19 / TypeScript
- StellarWalletsKit for multi-wallet (Freighter, xBull, Lobstr, Albedo, WalletConnect)
- TanStack Query for contract reads with polling (5-15s intervals)
- Zustand store for global state (wallet, grants, events, transactions, UI)
- Contract calls via `Contract.call()` for reads, `TransactionBuilder` + `rpc.assembleTransaction` + wallet signing for writes
- `signAndSendTransaction` polls `server.getTransaction` until confirmed
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin

### Key Pitfalls Avoided
- `token::StellarAssetClient` for token operations (not generic token::Client)
- `nativeToScVal(v, {type: "string"})` not `nativeToScVal(v)` for strings
- Storage `set(&key, &val)` with references, but Map methods take owned values
- `env.register(ContractName, ())` not `env.register_contract()`
- `Address::generate(&env)` not `Address::random()`
