import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDYUT22J2WTVBSVHZGXBUYU4OGR6ZWVDAPCOD4HEUS5QPKUXV44OPYU3",
  }
} as const


export interface Grant {
  amount: i128;
  beneficiary: string;
  cliff: u64;
  duration: u64;
  released: i128;
  revocable: boolean;
  revoked: boolean;
  start: u64;
  token: string;
}

export type DataKey = {tag: "Admin", values: void} | {tag: "Grant", values: readonly [u64]} | {tag: "GrantCount", values: void};

export interface Client {
  /**
   * Construct and simulate a revoke transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  revoke: ({admin, grant_id}: {admin: string, grant_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a release transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  release: ({caller, grant_id}: {caller: string, grant_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_grant: ({grant_id}: {grant_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Grant>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_grant: ({admin, token, beneficiary, amount, start, cliff, duration, revocable}: {admin: string, token: string, beneficiary: string, amount: i128, start: u64, cliff: u64, duration: u64, revocable: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_releasable transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_releasable: ({grant_id}: {grant_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_grant_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_grant_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABUdyYW50AAAAAAAACQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAtiZW5lZmljaWFyeQAAAAATAAAAAAAAAAVjbGlmZgAAAAAAAAYAAAAAAAAACGR1cmF0aW9uAAAABgAAAAAAAAAIcmVsZWFzZWQAAAALAAAAAAAAAAlyZXZvY2FibGUAAAAAAAABAAAAAAAAAAdyZXZva2VkAAAAAAEAAAAAAAAABXN0YXJ0AAAAAAAABgAAAAAAAAAFdG9rZW4AAAAAAAAT",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAAFR3JhbnQAAAAAAAABAAAABgAAAAAAAAAAAAAACkdyYW50Q291bnQAAA==",
        "AAAAAAAAAAAAAAAGcmV2b2tlAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACGdyYW50X2lkAAAABgAAAAA=",
        "AAAAAAAAAAAAAAAHcmVsZWFzZQAAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACGdyYW50X2lkAAAABgAAAAEAAAAL",
        "AAAAAAAAAAAAAAAJZ2V0X2dyYW50AAAAAAAAAQAAAAAAAAAIZ3JhbnRfaWQAAAAGAAAAAQAAB9AAAAAFR3JhbnQAAAA=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAMY3JlYXRlX2dyYW50AAAACAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAAC2JlbmVmaWNpYXJ5AAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAFc3RhcnQAAAAAAAAGAAAAAAAAAAVjbGlmZgAAAAAAAAYAAAAAAAAACGR1cmF0aW9uAAAABgAAAAAAAAAJcmV2b2NhYmxlAAAAAAAAAQAAAAEAAAAG",
        "AAAAAAAAAAAAAAAOZ2V0X3JlbGVhc2FibGUAAAAAAAEAAAAAAAAACGdyYW50X2lkAAAABgAAAAEAAAAL",
        "AAAAAAAAAAAAAAAPZ2V0X2dyYW50X2NvdW50AAAAAAAAAAABAAAABg==" ]),
      options
    )
  }
  public readonly fromJSON = {
    revoke: this.txFromJSON<null>,
        release: this.txFromJSON<i128>,
        get_grant: this.txFromJSON<Grant>,
        initialize: this.txFromJSON<null>,
        create_grant: this.txFromJSON<u64>,
        get_releasable: this.txFromJSON<i128>,
        get_grant_count: this.txFromJSON<u64>
  }
}