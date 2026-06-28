export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function parseContractError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("already initialized")) return "Contract already initialized";
    if (msg.includes("not admin")) return "Only the admin can perform this action";
    if (msg.includes("not beneficiary")) return "Only the beneficiary can release tokens";
    if (msg.includes("grant revoked")) return "This grant has been revoked";
    if (msg.includes("grant not revocable")) return "This grant is not revocable";
    if (msg.includes("already revoked")) return "Grant already revoked";
    if (msg.includes("amount must be positive")) return "Amount must be greater than 0";
    if (msg.includes("duration must be positive")) return "Duration must be greater than 0";
    if (msg.includes("Could not find")) return "Grant not found";
    if (msg.includes("User rejected")) return "Transaction was rejected by user";
    if (msg.includes("Insufficient")) return "Insufficient balance";
    if (msg.includes("Wallet not found")) return "Wallet not found. Please install Freighter or another Stellar wallet";
    return msg;
  }
  return "An unknown error occurred";
}

export function formatAmount(amount: string, decimals = 7): string {
  const num = Number(amount) / 10 ** decimals;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
  return num.toFixed(2);
}

export function getExplorerUrl(hash: string, type: "tx" | "contract" | "account" = "tx"): string {
  const base = "https://stellar.expert/explorer/testnet";
  if (type === "tx") return `${base}/tx/${hash}`;
  if (type === "contract") return `${base}/contract/${hash}`;
  return `${base}/account/${hash}`;
}

export function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
