import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, networks } from "contract";
import { RPC_URL, NETWORK_PASSPHRASE } from "@/contracts/config";
import { useStore } from "@/store";
import { kit } from "@/lib/wallet";
import type { Grant as BindingsGrant } from "contract";
import type { Grant } from "@/types";

// Use the contract address from bindings which is the actual deployed contract
const CONTRACT_ID = networks.testnet.contractId;

/**
 * Create a Client instance for read-only calls (no wallet needed).
 * For writes, we pass signTransaction and publicKey via MethodOptions.
 */
function createClient() {
  return new Client({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    allowHttp: true,
  });
}

function mapGrant(g: BindingsGrant, id: number): Grant {
  return {
    token: g.token,
    beneficiary: g.beneficiary,
    amount: String(g.amount),
    start: String(g.start),
    cliff: String(g.cliff),
    duration: String(g.duration),
    released: String(g.released),
    revoked: g.revoked,
    revocable: g.revocable,
  };
}

// --- Read functions (simulate-only, no signing needed) ---

export function useGrantCount() {
  return useQuery({
    queryKey: ["grantCount"],
    queryFn: async () => {
      const client = createClient();
      const { result } = await client.get_grant_count();
      return Number(result);
    },
  });
}

export function useGrants(limit = 10) {
  const { grantCount } = useStore();

  return useQuery({
    queryKey: ["grants", grantCount],
    queryFn: async (): Promise<Grant[]> => {
      const client = createClient();
      const grants: Grant[] = [];
      try {
        const { result: countRaw } = await client.get_grant_count();
        const count = Number(countRaw);
        for (let i = 1; i <= count && i <= limit; i++) {
          try {
            const { result } = await client.get_grant({ grant_id: BigInt(i) });
            grants.push(mapGrant(result, i));
          } catch {
            // skip individual grant errors
          }
        }
      } catch {
        // no grants yet
      }
      return grants;
    },
    refetchInterval: 10000,
  });
}

export function useGrant(grantId: number | null) {
  return useQuery({
    queryKey: ["grant", grantId],
    queryFn: async (): Promise<Grant | null> => {
      if (!grantId) return null;
      const client = createClient();
      const { result } = await client.get_grant({ grant_id: BigInt(grantId) });
      return mapGrant(result, grantId);
    },
    enabled: !!grantId,
    refetchInterval: 5000,
  });
}

export function useReleasable(grantId: number | null) {
  return useQuery({
    queryKey: ["releasable", grantId],
    queryFn: async (): Promise<string> => {
      if (!grantId) return "0";
      const client = createClient();
      const { result } = await client.get_releasable({ grant_id: BigInt(grantId) });
      return String(result);
    },
    enabled: !!grantId,
    refetchInterval: 5000,
  });
}

// --- Write functions (sign and send via wallet) ---

async function getSignTransaction() {
  return async (xdr: string, opts?: { networkPassphrase?: string }) => {
    const { signedTxXdr, signerAddress } = await kit.signTransaction(xdr, {
      networkPassphrase: opts?.networkPassphrase || NETWORK_PASSPHRASE,
    });
    return { signedTxXdr, signerAddress };
  };
}

export function useCreateGrant() {
  const queryClient = useQueryClient();
  const addTransaction = useStore((s) => s.addTransaction);

  return useMutation({
    mutationFn: async (params: {
      admin: string;
      token: string;
      beneficiary: string;
      amount: string;
      start: string;
      cliff: string;
      duration: string;
      revocable: boolean;
    }) => {
      const client = createClient();
      const signTransaction = await getSignTransaction();

      const tx = await client.create_grant(
        {
          admin: params.admin,
          token: params.token,
          beneficiary: params.beneficiary,
          amount: BigInt(params.amount),
          start: BigInt(params.start),
          cliff: BigInt(params.cliff),
          duration: BigInt(params.duration),
          revocable: params.revocable,
        },
        { signTransaction, publicKey: params.admin }
      );

      const sent = await tx.signAndSend();
      return { hash: sent.sendTransactionResponse?.hash || "" };
    },
    onSuccess: (result) => {
      if (result.hash) {
        addTransaction({
          hash: result.hash,
          status: "success",
          type: "create_grant",
          timestamp: Date.now(),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["grants"] });
    },
    onError: (error) => {
      addTransaction({
        hash: "",
        status: "failed",
        type: "create_grant",
        timestamp: Date.now(),
        message: error.message,
      });
    },
  });
}

export function useRelease() {
  const queryClient = useQueryClient();
  const addTransaction = useStore((s) => s.addTransaction);

  return useMutation({
    mutationFn: async (params: { caller: string; grantId: number }) => {
      const client = createClient();
      const signTransaction = await getSignTransaction();

      const tx = await client.release(
        { caller: params.caller, grant_id: BigInt(params.grantId) },
        { signTransaction, publicKey: params.caller }
      );

      const sent = await tx.signAndSend();
      return { hash: sent.sendTransactionResponse?.hash || "" };
    },
    onSuccess: (result) => {
      if (result.hash) {
        addTransaction({
          hash: result.hash,
          status: "success",
          type: "release",
          timestamp: Date.now(),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["grants"] });
      queryClient.invalidateQueries({ queryKey: ["releasable"] });
    },
    onError: (error) => {
      addTransaction({
        hash: "",
        status: "failed",
        type: "release",
        timestamp: Date.now(),
        message: error.message,
      });
    },
  });
}

export function useRevoke() {
  const queryClient = useQueryClient();
  const addTransaction = useStore((s) => s.addTransaction);

  return useMutation({
    mutationFn: async (params: { admin: string; grantId: number }) => {
      const client = createClient();
      const signTransaction = await getSignTransaction();

      const tx = await client.revoke(
        { admin: params.admin, grant_id: BigInt(params.grantId) },
        { signTransaction, publicKey: params.admin }
      );

      const sent = await tx.signAndSend();
      return { hash: sent.sendTransactionResponse?.hash || "" };
    },
    onSuccess: (result) => {
      if (result.hash) {
        addTransaction({
          hash: result.hash,
          status: "success",
          type: "revoke",
          timestamp: Date.now(),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["grants"] });
    },
    onError: (error) => {
      addTransaction({
        hash: "",
        status: "failed",
        type: "revoke",
        timestamp: Date.now(),
        message: error.message,
      });
    },
  });
}

export function useInitialize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (admin: string) => {
      const client = createClient();
      const signTransaction = await getSignTransaction();

      const tx = await client.initialize(
        { admin },
        { signTransaction, publicKey: admin }
      );

      const sent = await tx.signAndSend();
      return { hash: sent.sendTransactionResponse?.hash || "" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grantCount"] });
    },
  });
}
