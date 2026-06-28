import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { LobstrModule } from "@creit.tech/stellar-wallets-kit/modules/lobstr";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { WalletConnectModule } from "@creit.tech/stellar-wallets-kit/modules/wallet-connect";
import { NETWORK_PASSPHRASE, RPC_URL } from "@/contracts/config";

let initialized = false;

function ensureInit() {
  if (initialized) return;
  initialized = true;
  StellarWalletsKit.init({
    network: Networks.TESTNET,
    selectedWalletId: "freighter",
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new LobstrModule(),
      new AlbedoModule(),
      new WalletConnectModule({
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id",
        metadata: {
          name: "TokenVesting",
          description: "Token Vesting Dashboard",
          url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
          icons: [],
        },
      }),
    ],
  });
}

export const kit = StellarWalletsKit;

export async function connectWallet(): Promise<string> {
  ensureInit();
  const { address } = await kit.authModal();
  return address;
}

export async function disconnectWallet(): Promise<void> {
  ensureInit();
  await kit.disconnect();
}

export async function getAddress(): Promise<string | null> {
  try {
    ensureInit();
    const { address } = await kit.getAddress();
    return address;
  } catch {
    return null;
  }
}

export async function signAndSendTransaction(
  xdrString: string
): Promise<{ hash: string }> {
  ensureInit();
  const { signedTxXdr } = await kit.signTransaction(xdrString, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const { Server } = await import("@stellar/stellar-sdk/rpc");
  const { Transaction } = await import("@stellar/stellar-sdk");
  const server = new Server(RPC_URL);
  const signedTx = new Transaction(signedTxXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(signedTx);
  if (result.status === "PENDING") {
    // Wait for confirmation
    let getResult = await server.getTransaction(result.hash);
    while (getResult.status === "NOT_FOUND") {
      await new Promise((r) => setTimeout(r, 1000));
      getResult = await server.getTransaction(result.hash);
    }
    if (getResult.status === "SUCCESS") {
      return { hash: result.hash };
    }
    throw new Error(`Transaction failed: ${JSON.stringify(getResult)}`);
  }
  throw new Error(`Transaction submission failed: ${result.status}`);
}

export async function getIsConnected(): Promise<boolean> {
  const addr = await getAddress();
  return !!addr;
}
