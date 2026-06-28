"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTimeAgo, shortenAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { rpc } from "@stellar/stellar-sdk";
import { scValToNative } from "@stellar/stellar-sdk";
import { RPC_URL, CONTRACT_ID } from "@/contracts/config";

export function ActivityFeed() {
  const { events, addEvent } = useStore();
  const server = new rpc.Server(RPC_URL);

  const { data: ledgerData } = useQuery({
    queryKey: ["ledgerEvents"],
    queryFn: async () => {
      try {
        const resp = await server.getEvents({
          filters: [{ contractIds: [CONTRACT_ID] }],
          startLedger: 0,
          limit: 20,
        });
        return resp;
      } catch {
        return null;
      }
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (ledgerData?.events) {
      for (const event of ledgerData.events) {
        // Convert ScVal topics to readable strings
        const topics = event.topic.map((t) => {
          try {
            return String(scValToNative(t));
          } catch {
            return "unknown";
          }
        });
        const eventType = topics[0] || "unknown";

        addEvent({
          type: eventType,
          timestamp: Math.floor(new Date(event.ledgerClosedAt).getTime() / 1000) || Math.floor(Date.now() / 1000),
          address: event.contractId?.toString() || "",
          data: {},
          txHash: event.txHash,
        });
      }
    }
  }, [ledgerData, addEvent]);

  const eventColors: Record<string, string> = {
    grant_created: "info",
    released: "success",
    revoked: "error",
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📡</div>
            <p className="text-zinc-500 text-sm">
              No activity yet. Events will appear here when contract
              interactions occur.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => (
              <div
                key={`${event.txHash}-${i}`}
                className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        (eventColors[event.type] as
                          | "success"
                          | "warning"
                          | "error"
                          | "info"
                          | "neutral") || "neutral"
                      }
                    >
                      {event.type.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-zinc-500">
                      {getTimeAgo(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 truncate">
                    {event.address && shortenAddress(event.address)}
                  </p>
                  {event.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
                    >
                      View transaction →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
