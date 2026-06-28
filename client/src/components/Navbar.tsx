"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shortenAddress } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, setWalletModalOpen } = useStore();

  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/activity", label: "Activity" },
    { href: "/transactions", label: "Transactions" },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold text-zinc-100 tracking-tight"
            >
              TokenVesting
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === link.href
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                <Badge variant="success">Connected</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWalletModalOpen(true)}
                >
                  {shortenAddress(address)}
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setWalletModalOpen(true)}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
