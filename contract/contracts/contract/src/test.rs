#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events as _, Ledger as _},
    token, Env,
};

fn create_token(env: &Env, admin: &Address) -> Address {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_addr = sac.address();
    let sac_client = token::StellarAssetClient::new(env, &token_addr);
    sac_client.mint(admin, &1_000_000_000);
    token_addr
}

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let grant_count = client.get_grant_count();
    assert_eq!(grant_count, 0);
}

#[test]
fn test_create_grant() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let token = create_token(&env, &admin);

    client.initialize(&admin);

    let grant_id = client.create_grant(
        &admin,
        &token,
        &beneficiary,
        &1_000_000,
        &1000000,
        &3600,
        &86400,
        &true,
    );

    assert_eq!(grant_id, 1);

    let grant = client.get_grant(&grant_id);
    assert_eq!(grant.beneficiary, beneficiary);
    assert_eq!(grant.amount, 1_000_000);
    assert!(!grant.revoked);
}

#[test]
fn test_cliff_not_reached() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let token = create_token(&env, &admin);

    client.initialize(&admin);

    let grant_id = client.create_grant(
        &admin,
        &token,
        &beneficiary,
        &1_000_000,
        &1000000,
        &3600,  // cliff = 1 hour
        &86400, // duration = 1 day
        &true,
    );

    // Before cliff - should be 0 releasable
    let releasable = client.get_releasable(&grant_id);
    assert_eq!(releasable, 0);
}

#[test]
fn test_partial_vesting_after_cliff() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let token = create_token(&env, &admin);

    client.initialize(&admin);

    let grant_id = client.create_grant(
        &admin,
        &token,
        &beneficiary,
        &86_400_000,
        &1000000, // start
        &3600,    // cliff = 1 hour
        &86400,   // duration = 1 day (86400 seconds)
        &true,
    );

    // Advance time past cliff to halfway through vesting (12 hours in)
    env.ledger().set_timestamp(1000000 + 43200);

    let releasable = client.get_releasable(&grant_id);
    // Halfway through: 86_400_000 * 43200 / 86400 = 43_200_000
    assert_eq!(releasable, 43_200_000);
}

#[test]
fn test_full_release() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let token = create_token(&env, &admin);

    client.initialize(&admin);

    let grant_id = client.create_grant(
        &admin,
        &token,
        &beneficiary,
        &1_000_000,
        &1000000, // start
        &0,       // no cliff
        &86400,   // duration = 1 day
        &true,
    );

    // Advance past full duration
    env.ledger().set_timestamp(1000000 + 86400);

    let amount = client.release(&beneficiary, &grant_id);
    assert_eq!(amount, 1_000_000);
}

#[test]
fn test_release_multiple_times() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let token = create_token(&env, &admin);

    client.initialize(&admin);

    let grant_id = client.create_grant(
        &admin,
        &token,
        &beneficiary,
        &86_400_000,
        &1000000,
        &0,
        &86400,
        &true,
    );

    // Advance halfway
    env.ledger().set_timestamp(1000000 + 43200);
    let amount1 = client.release(&beneficiary, &grant_id);
    assert_eq!(amount1, 43_200_000);

    // Advance to full
    env.ledger().set_timestamp(1000000 + 86400);
    let amount2 = client.release(&beneficiary, &grant_id);
    assert_eq!(amount2, 43_200_000); // remaining after first release
}

#[test]
fn test_revoke_before_vesting() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let token = create_token(&env, &admin);

    client.initialize(&admin);

    let grant_id = client.create_grant(
        &admin,
        &token,
        &beneficiary,
        &1_000_000,
        &1000000,
        &3600,  // cliff = 1 hour
        &86400,
        &true,  // revocable
    );

    let sac_client = token::StellarAssetClient::new(&env, &token);
    let admin_balance_before = sac_client.balance(&admin);
    let beneficiary_balance_before = sac_client.balance(&beneficiary);

    client.revoke(&admin, &grant_id);

    let grant = client.get_grant(&grant_id);
    assert!(grant.revoked);

    // Admin should have all tokens back
    let admin_balance = sac_client.balance(&admin);
    assert_eq!(admin_balance, admin_balance_before + 1_000_000);
    assert_eq!(sac_client.balance(&beneficiary), beneficiary_balance_before);
}

#[test]
fn test_revoke_after_partial_vesting() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let token = create_token(&env, &admin);

    client.initialize(&admin);

    let sac_client = token::StellarAssetClient::new(&env, &token);

    let grant_id = client.create_grant(
        &admin,
        &token,
        &beneficiary,
        &86_400_000,
        &1000000,
        &0,
        &86400,
        &true,
    );

    // Advance halfway
    env.ledger().set_timestamp(1000000 + 43200);
    let beneficiary_before = sac_client.balance(&beneficiary);
    let admin_before = sac_client.balance(&admin);

    client.revoke(&admin, &grant_id);

    // Beneficiary gets vested portion
    assert_eq!(sac_client.balance(&beneficiary), beneficiary_before + 43_200_000);
    // Admin gets remainder
    assert_eq!(sac_client.balance(&admin), admin_before + 43_200_000);
}

#[test]
fn test_revoke_non_revocable_fails() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let token = create_token(&env, &admin);

    client.initialize(&admin);

    let grant_id = client.create_grant(
        &admin,
        &token,
        &beneficiary,
        &1_000_000,
        &1000000,
        &0,
        &86400,
        &false, // not revocable
    );

    // Use try_revoke which returns a Result
    let result = client.try_revoke(&admin, &grant_id);
    assert!(result.is_err());
}

#[test]
fn test_events_emitted() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000000);

    let contract_id = env.register(TokenVesting, ());
    let client = TokenVestingClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let token = create_token(&env, &admin);

    client.initialize(&admin);

    client.create_grant(
        &admin,
        &token,
        &beneficiary,
        &1_000_000,
        &1000000,
        &0,
        &86400,
        &true,
    );

    // Check events were emitted
    let events = env.events().all();
    let raw_events = events.events();
    assert!(!raw_events.is_empty());
}
