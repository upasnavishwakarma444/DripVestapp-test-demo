import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Token Vesting
          </h1>
          <p className="text-xl text-zinc-400 max-w-lg mx-auto">
            Manage token vesting on Stellar Soroban with cliff periods, linear
            release schedules, and revocable team grants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="text-2xl mb-2">⏱️</div>
            <h3 className="font-semibold text-zinc-200 mb-1">
              Cliff Periods
            </h3>
            <p className="text-sm text-zinc-500">
              Set a cliff duration before any tokens become vested
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold text-zinc-200 mb-1">
              Linear Release
            </h3>
            <p className="text-sm text-zinc-500">
              Tokens vest linearly over the specified duration
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="font-semibold text-zinc-200 mb-1">
              Revocable Grants
            </h3>
            <p className="text-sm text-zinc-500">
              Admin can revoke grants and reclaim unvested tokens
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Launch Dashboard
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
          <Link
            href="/activity"
            className="inline-flex items-center px-6 py-3 border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:bg-zinc-800 transition"
          >
            View Activity
          </Link>
        </div>
      </div>
    </div>
  );
}
