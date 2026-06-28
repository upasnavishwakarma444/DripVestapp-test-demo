export interface Grant {
  token: string;
  beneficiary: string;
  amount: string;
  start: string;
  cliff: string;
  duration: string;
  released: string;
  revoked: boolean;
  revocable: boolean;
}

export interface GrantView extends Grant {
  id: number;
  releasable: string;
  vested: string;
  progress: number;
}

export interface ContractEvent {
  type: string;
  timestamp: number;
  address: string;
  data: Record<string, unknown>;
  txHash: string;
}

export interface Transaction {
  hash: string;
  status: "pending" | "success" | "failed";
  type: string;
  timestamp: number;
  message?: string;
}

export interface WalletState {
  address: string | null;
  network: string;
  isConnected: boolean;
}

export interface CreateGrantParams {
  token: string;
  beneficiary: string;
  amount: string;
  start: string;
  cliff: string;
  duration: string;
  revocable: boolean;
}
