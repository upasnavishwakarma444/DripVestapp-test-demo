import { VestingDashboard } from "@/components/VestingDashboard";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-500 mt-1">
          Create and manage token vesting grants
        </p>
      </div>
      <VestingDashboard />
    </div>
  );
}
