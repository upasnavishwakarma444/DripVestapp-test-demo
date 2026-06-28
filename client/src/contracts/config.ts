// Contract configuration
export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  "CDYUT22J2WTVBSVHZGXBUYU4OGR6ZWVDAPCOD4HEUS5QPKUXV44OPYU3";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";
