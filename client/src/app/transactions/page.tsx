import { TransactionHistory } from "@/components/TransactionHistory";

export default function TransactionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Transactions</h1>
        <p className="text-zinc-500 mt-1">
          Track your contract interactions and their status
        </p>
      </div>
      <TransactionHistory />
    </div>
  );
}
