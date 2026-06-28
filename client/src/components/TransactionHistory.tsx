"use client";

import { useStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getExplorerUrl, getTimeAgo } from "@/lib/utils";

export function TransactionHistory() {
  const { transactions } = useStore();

  const statusVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
    pending: "warning",
    success: "success",
    failed: "error",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-zinc-500 text-sm">
              No transactions yet. Your contract interactions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <div
                key={tx.hash || i}
                className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusVariant[tx.status] || "neutral"}>
                      {tx.status}
                    </Badge>
                    <span className="text-sm text-zinc-300 capitalize">
                      {tx.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  {tx.hash && (
                    <a
                      href={getExplorerUrl(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-mono truncate block"
                    >
                      {tx.hash.slice(0, 16)}...{tx.hash.slice(-8)}
                    </a>
                  )}
                  {tx.message && (
                    <p className="text-xs text-red-400 mt-1">{tx.message}</p>
                  )}
                </div>
                <span className="text-xs text-zinc-600 whitespace-nowrap ml-4">
                  {getTimeAgo(Math.floor(tx.timestamp / 1000))}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
