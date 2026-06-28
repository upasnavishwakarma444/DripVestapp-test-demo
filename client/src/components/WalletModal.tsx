"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { connectWallet, disconnectWallet } from "@/lib/wallet";

export function WalletModal() {
  const {
    isWalletModalOpen,
    setWalletModalOpen,
    address,
    setWallet,
    disconnect: disconnectStore,
  } = useStore();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isWalletModalOpen) return null;

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      const addr = await connectWallet();
      setWallet(addr, "testnet");
      setWalletModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect wallet"
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch {
      // ignore
    }
    disconnectStore();
    setWalletModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setWalletModalOpen(false)}
      />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">
            {address ? "Wallet" : "Connect Wallet"}
          </h2>
          <button
            onClick={() => setWalletModalOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {address ? (
          <div className="space-y-4">
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-400 mb-1">Connected Address</p>
              <p className="text-zinc-100 font-mono text-sm break-all">
                {address}
              </p>
            </div>
            <Button
              variant="danger"
              className="w-full"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleConnect}
              loading={connecting}
            >
              {connecting ? "Connecting..." : "Choose Wallet"}
            </Button>
            <p className="text-xs text-zinc-600 text-center">
              Click to open the wallet selection modal. Freighter, xBull,
              Lobstr, Albedo, and WalletConnect are supported.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
