"use client";

import { useStore } from "@/store";
import { CreateGrantForm } from "./CreateGrantForm";
import { GrantCard } from "./GrantCard";
import { useGrants } from "@/hooks/contract";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Grant } from "@/types";

export function VestingDashboard() {
  const { address } = useStore();
  const { data: grants, isLoading, error } = useGrants();

  if (!address) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-semibold text-zinc-300 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-zinc-500 max-w-md mx-auto">
          Connect a Stellar wallet to manage token vesting grants
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create Grant Form */}
      <div className="lg:col-span-1">
        <CreateGrantForm />
      </div>

      {/* Grants List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-100">
            Grants ({grants?.length || 0})
          </h2>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-zinc-800 rounded w-1/3" />
                  <div className="h-3 bg-zinc-800 rounded w-1/4" />
                  <div className="h-2 bg-zinc-800 rounded-full" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-4 bg-zinc-800 rounded" />
                    <div className="h-4 bg-zinc-800 rounded" />
                    <div className="h-4 bg-zinc-800 rounded" />
                    <div className="h-4 bg-zinc-800 rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-400">Failed to load grants: {error.message}</p>
            <p className="text-sm text-zinc-500 mt-2">
              Make sure the contract is deployed and CONTRACT_ID is set in your
              environment.
            </p>
          </div>
        )}

        {!isLoading && !error && grants?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-zinc-400 mb-2">
              No grants yet
            </h3>
            <p className="text-zinc-600 text-sm">
              Create your first vesting grant using the form on the left
            </p>
          </div>
        )}

        {!isLoading && grants && (
          <div className="space-y-4">
            {(grants as Grant[]).map((grant, index) => (
              <GrantCard key={index} grant={grant} id={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
