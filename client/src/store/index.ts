import { create } from "zustand";
import type { Grant, ContractEvent, Transaction } from "@/types";

interface AppState {
  // Wallet
  address: string | null;
  isConnected: boolean;
  network: string;
  setWallet: (address: string | null, network: string) => void;
  disconnect: () => void;

  // Grants
  grants: Grant[];
  grantCount: number;
  selectedGrantId: number | null;
  setGrants: (grants: Grant[]) => void;
  setGrantCount: (count: number) => void;
  addGrant: (grant: Grant) => void;
  setSelectedGrantId: (id: number | null) => void;
  updateGrant: (id: number, grant: Partial<Grant>) => void;

  // Events
  events: ContractEvent[];
  addEvent: (event: ContractEvent) => void;
  setEvents: (events: ContractEvent[]) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (hash: string, updates: Partial<Transaction>) => void;

  // UI
  isWalletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Wallet
  address: null,
  isConnected: false,
  network: "testnet",
  setWallet: (address, network) =>
    set({ address, network, isConnected: !!address }),
  disconnect: () =>
    set({ address: null, isConnected: false }),

  // Grants
  grants: [],
  grantCount: 0,
  selectedGrantId: null,
  setGrants: (grants) => set({ grants }),
  setGrantCount: (grantCount) => set({ grantCount }),
  addGrant: (grant) => set((s) => ({ grants: [...s.grants, grant] })),
  setSelectedGrantId: (selectedGrantId) => set({ selectedGrantId }),
  updateGrant: (id, updates) =>
    set((s) => ({
      grants: s.grants.map((g, i) =>
        i + 1 === id ? { ...g, ...updates } : g
      ),
    })),

  // Events
  events: [],
  addEvent: (event) => set((s) => ({ events: [event, ...s.events].slice(0, 100) })),
  setEvents: (events) => set({ events }),

  // Transactions
  transactions: [],
  addTransaction: (tx) =>
    set((s) => ({ transactions: [tx, ...s.transactions].slice(0, 50) })),
  updateTransaction: (hash, updates) =>
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.hash === hash ? { ...t, ...updates } : t
      ),
    })),

  // UI
  isWalletModalOpen: false,
  setWalletModalOpen: (isWalletModalOpen) => set({ isWalletModalOpen }),
}));
