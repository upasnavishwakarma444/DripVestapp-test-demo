#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Symbol};

#[contracttype]
pub enum DataKey {
    Admin,
    Grant(u64),
    GrantCount,
}

#[contracttype]
#[derive(Clone)]
pub struct Grant {
    pub token: Address,
    pub beneficiary: Address,
    pub amount: i128,
    pub start: u64,
    pub cliff: u64,
    pub duration: u64,
    pub released: i128,
    pub revoked: bool,
    pub revocable: bool,
}

#[contract]
pub struct TokenVesting;

#[contractimpl]
impl TokenVesting {
    pub fn initialize(env: Env, admin: Address) {
        assert!(!env.storage().instance().has(&DataKey::Admin), "already initialized");
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn create_grant(
        env: Env,
        admin: Address,
        token: Address,
        beneficiary: Address,
        amount: i128,
        start: u64,
        cliff: u64,
        duration: u64,
        revocable: bool,
    ) -> u64 {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "not admin");
        assert!(amount > 0, "amount must be positive");
        assert!(duration > 0, "duration must be positive");

        let self_addr = env.current_contract_address();
        token::Client::new(&env, &token).transfer(&admin, &self_addr, &amount);

        let mut grant_count: u64 = env.storage().instance().get(&DataKey::GrantCount).unwrap_or(0);
        grant_count += 1;

        let grant = Grant {
            token,
            beneficiary: beneficiary.clone(),
            amount,
            start,
            cliff,
            duration,
            released: 0,
            revoked: false,
            revocable,
        };

        env.storage().persistent().set(&DataKey::Grant(grant_count), &grant);
        env.storage().instance().set(&DataKey::GrantCount, &grant_count);

        env.events().publish(
            (Symbol::new(&env, "grant_created"),),
            (grant_count, beneficiary, amount),
        );

        grant_count
    }

    pub fn release(env: Env, caller: Address, grant_id: u64) -> i128 {
        caller.require_auth();
        let mut grant: Grant = env.storage().persistent().get(&DataKey::Grant(grant_id)).unwrap();
        assert_eq!(caller, grant.beneficiary, "not beneficiary");
        assert!(!grant.revoked, "grant revoked");

        let current = env.ledger().timestamp();
        let vested = Self::calculate_vested(&grant, current);
        let releasable = vested - grant.released;

        if releasable > 0 {
            grant.released = vested;
            env.storage().persistent().set(&DataKey::Grant(grant_id), &grant);
            token::Client::new(&env, &grant.token).transfer(
                &env.current_contract_address(),
                &caller,
                &releasable,
            );
        }

        env.events().publish(
            (Symbol::new(&env, "released"),),
            (grant_id, caller.clone(), releasable),
        );

        releasable
    }

    pub fn revoke(env: Env, admin: Address, grant_id: u64) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "not admin");

        let mut grant: Grant = env.storage().persistent().get(&DataKey::Grant(grant_id)).unwrap();
        assert!(grant.revocable, "grant not revocable");
        assert!(!grant.revoked, "already revoked");

        grant.revoked = true;
        let current = env.ledger().timestamp();
        let vested = Self::calculate_vested(&grant, current);
        let releasable = vested - grant.released;

        if releasable > 0 {
            grant.released = vested;
            token::Client::new(&env, &grant.token).transfer(
                &env.current_contract_address(),
                &grant.beneficiary,
                &releasable,
            );
        }

        let remainder = grant.amount - grant.released;
        if remainder > 0 {
            token::Client::new(&env, &grant.token).transfer(
                &env.current_contract_address(),
                &admin,
                &remainder,
            );
        }

        env.storage().persistent().set(&DataKey::Grant(grant_id), &grant);

        env.events().publish(
            (Symbol::new(&env, "revoked"),),
            (grant_id, admin.clone()),
        );
    }

    pub fn get_grant(env: Env, grant_id: u64) -> Grant {
        env.storage().persistent().get(&DataKey::Grant(grant_id)).unwrap()
    }

    pub fn get_releasable(env: Env, grant_id: u64) -> i128 {
        let grant: Grant = env.storage().persistent().get(&DataKey::Grant(grant_id)).unwrap();
        let current = env.ledger().timestamp();
        Self::calculate_vested(&grant, current) - grant.released
    }

    pub fn get_grant_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::GrantCount).unwrap_or(0)
    }

    fn calculate_vested(grant: &Grant, current: u64) -> i128 {
        if current < grant.start + grant.cliff {
            return 0;
        }
        if current >= grant.start + grant.duration {
            return grant.amount;
        }
        let elapsed = current - grant.start;
        grant.amount * (elapsed as i128) / (grant.duration as i128)
    }
}

mod test;
