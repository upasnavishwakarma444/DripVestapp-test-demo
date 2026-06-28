"use client";

import { useStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRelease, useRevoke, useReleasable } from "@/hooks/contract";
import { shortenAddress, getTimeAgo, formatAmount, parseContractError } from "@/lib/utils";
import type { Grant } from "@/types";

interface GrantCardProps {
  grant: Grant;
  id: number;
}

export function GrantCard({ grant, id }: GrantCardProps) {
  const { address } = useStore();
  const release = useRelease();
  const revoke = useRevoke();
  const { data: releasable } = useReleasable(id);

  const isBeneficiary = address === grant.beneficiary;
  const isAdmin = true; // We'll determine this differently
  const canRelease = isBeneficiary && !grant.revoked && Number(releasable || "0") > 0;
  const canRevoke = grant.revocable && !grant.revoked;

  const totalVested = Number(grant.released) + Number(releasable || "0");
  const progress = Number(grant.amount) > 0
    ? Math.min(100, (totalVested / Number(grant.amount)) * 100)
    : 0;

  const handleRelease = async () => {
    if (!address) return;
    try {
      await release.mutateAsync({ caller: address, grantId: id });
    } catch (err) {
      console.error(parseContractError(err));
    }
  };

  const handleRevoke = async () => {
    if (!address) return;
    try {
      await revoke.mutateAsync({ admin: address, grantId: id });
    } catch (err) {
      console.error(parseContractError(err));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Grant #{id}
            {grant.revoked && <Badge variant="error">Revoked</Badge>}
            {!grant.revoked && <Badge variant="success">Active</Badge>}
            {!grant.revocable && <Badge variant="info">Locked</Badge>}
          </CardTitle>
        </div>
        <div className="text-right text-sm text-zinc-400">
          {formatAmount(grant.amount)} tokens
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Vesting Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                grant.revoked ? "bg-red-500" : "bg-indigo-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500">Beneficiary</p>
            <p className="text-zinc-300 font-mono">
              {shortenAddress(grant.beneficiary)}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Released</p>
            <p className="text-zinc-300">{formatAmount(grant.released)}</p>
          </div>
          <div>
            <p className="text-zinc-500">Releasable</p>
            <p className="text-zinc-300 font-medium">
              {formatAmount(releasable || "0")}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Cliff</p>
            <p className="text-zinc-300">
              {Number(grant.cliff) > 0
                ? `${Math.round(Number(grant.cliff) / 3600)}h`
                : "None"}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Duration</p>
            <p className="text-zinc-300">
              {Math.round(Number(grant.duration) / 86400)}d
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Start</p>
            <p className="text-zinc-300">{getTimeAgo(Number(grant.start))}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {canRelease && (
            <Button
              size="sm"
              onClick={handleRelease}
              loading={release.isPending}
            >
              Release
            </Button>
          )}
          {canRevoke && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleRevoke}
              loading={revoke.isPending}
            >
              Revoke
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
