/**
 * TokenVesting Contract Deployment Script
 *
 * Usage:
 *   bun run scripts/deploy.ts
 *
 * Prerequisites:
 *   1. Build the contract first: cd ../contract && stellar contract build
 *   2. Set DEPLOYER_SECRET_KEY env var or let the script generate a keypair
 *
 * Environment variables (optional):
 *   DEPLOYER_SECRET_KEY - Secret key of the deployer account
 *   RPC_URL             - Soroban RPC URL
 *   NETWORK_PASSPHRASE  - Network passphrase
 */

import { rpc, TransactionBuilder, Keypair, Operation, Address } from "@stellar/stellar-sdk";
import { Api } from "@stellar/stellar-sdk/rpc";
import * as fs from "fs";
import * as path from "path";

const RPC_URL = process.env.RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  process.env.NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
const WASM_PATH = path.resolve(
  __dirname,
  "../../contract/target/wasm32v1-none/release/hello-world.wasm"
);

async function waitForTransaction(
  server: rpc.Server,
  hash: string
): Promise<Api.GetSuccessfulTransactionResponse> {
  let result = await server.getTransaction(hash);
  while (result.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1000));
    result = await server.getTransaction(hash);
  }
  if (result.status === "FAILED") {
    throw new Error(`Transaction failed: ${hash}`);
  }
  return result as Api.GetSuccessfulTransactionResponse;
}

async function simulateAndSend(
  server: rpc.Server,
  tx: import("@stellar/stellar-sdk").Transaction,
  keypair: Keypair
): Promise<string> {
  const sim = await server.simulateTransaction(tx);
  if (Api.isSimulationError(sim)) {
    throw new Error(`Simulation error: ${sim.error}`);
  }

  const assembled = rpc.assembleTransaction(tx, sim);
  const signedTx = assembled.build();
  signedTx.sign(keypair);

  const result = await server.sendTransaction(signedTx);
  if (result.status !== "PENDING") {
    throw new Error(`Submission failed: ${result.status}`);
  }
  return result.hash;
}

async function main() {
  let keypair: Keypair;
  if (process.env.DEPLOYER_SECRET_KEY) {
    keypair = Keypair.fromSecret(process.env.DEPLOYER_SECRET_KEY);
  } else {
    keypair = Keypair.random();
    console.log("Generated new keypair. Fund it with:");
    console.log(`  stellar keys generate --fund ${keypair.publicKey()}`);
    console.log(`Secret: ${keypair.secret()}`);
    process.exit(1);
  }

  const server = new rpc.Server(RPC_URL);
  const publicKey = keypair.publicKey();
  console.log(`Using deployer: ${publicKey}`);

  if (!fs.existsSync(WASM_PATH)) {
    console.error(`WASM not found at ${WASM_PATH}`);
    console.error("Build the contract first: cd contract && stellar contract build");
    process.exit(1);
  }
  const wasm = fs.readFileSync(WASM_PATH);
  console.log(`WASM size: ${wasm.length} bytes`);

  // ---- Step 1: Upload WASM ----
  console.log("\n--- Step 1: Uploading WASM ---");
  const account = await server.getAccount(publicKey);

  const uploadTx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.uploadContractWasm({ wasm }))
    .setTimeout(30)
    .build();

  const uploadHash = await simulateAndSend(server, uploadTx, keypair);
  console.log(`Upload sent! Hash: ${uploadHash}`);

  const uploadResult = await waitForTransaction(server, uploadHash);
  if (!uploadResult.returnValue) {
    throw new Error("No return value from upload");
  }
  const wasmHashBytes = uploadResult.returnValue.bytes();
  const wasmHashHex = Buffer.from(wasmHashBytes).toString("hex");
  console.log(`WASM hash: ${wasmHashHex}`);

  // ---- Step 2: Deploy contract ----
  console.log("\n--- Step 2: Deploying contract ---");
  const account2 = await server.getAccount(publicKey);

  const deployTx = new TransactionBuilder(account2, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.createCustomContract({
        address: new Address(publicKey),
        wasmHash: Buffer.from(wasmHashBytes),
      })
    )
    .setTimeout(30)
    .build();

  const deployHash = await simulateAndSend(server, deployTx, keypair);
  console.log(`Deploy sent! Hash: ${deployHash}`);

  const deployResult = await waitForTransaction(server, deployHash);
  if (!deployResult.returnValue) {
    throw new Error("No return value from deploy");
  }
  const contractAddress = Address.fromScVal(deployResult.returnValue);
  const contractId = contractAddress.toString();

  console.log(`\n✅ Contract deployed!`);
  console.log(`Contract ID: ${contractId}`);
  console.log(`\nAdd to .env.local:`);
  console.log(`NEXT_PUBLIC_CONTRACT_ID=${contractId}`);

  console.log(`\nTo initialize the contract, run:`);
  console.log(`  stellar contract invoke \\`);
  console.log(`    --id ${contractId} \\`);
  console.log(`    --source-account ${keypair.publicKey()} \\`);
  console.log(`    --network testnet \\`);
  console.log(`    -- \\`);
  console.log(`    initialize \\`);
  console.log(`    --admin ${keypair.publicKey()}`);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
