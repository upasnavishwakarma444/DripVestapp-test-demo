"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCreateGrant } from "@/hooks/contract";
import { parseContractError } from "@/lib/utils";

export function CreateGrantForm() {
  const { address } = useStore();
  const createGrant = useCreateGrant();

  const [beneficiary, setBeneficiary] = useState("");
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [cliff, setCliff] = useState("3600");
  const [duration, setDuration] = useState("2592000"); // 30 days
  const [revocable, setRevocable] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!beneficiary || !token || !amount) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await createGrant.mutateAsync({
        admin: address,
        token,
        beneficiary,
        amount,
        start: String(Math.floor(Date.now() / 1000)),
        cliff,
        duration,
        revocable,
      });

      // Reset form
      setBeneficiary("");
      setToken("");
      setAmount("");
    } catch (err) {
      setError(parseContractError(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Grant</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Token Address"
            placeholder="C..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Input
            label="Beneficiary Address"
            placeholder="G..."
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
          <Input
            label="Amount (in smallest units)"
            type="number"
            placeholder="10000000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cliff (seconds)"
              type="number"
              placeholder="3600"
              value={cliff}
              onChange={(e) => setCliff(e.target.value)}
            />
            <Input
              label="Duration (seconds)"
              type="number"
              placeholder="2592000"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={revocable}
              onChange={(e) => setRevocable(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700"
            />
            Revocable
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            loading={createGrant.isPending}
            disabled={!address}
          >
            {createGrant.isPending ? "Creating..." : "Create Grant"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
