import { ActivityFeed } from "@/components/ActivityFeed";

export default function ActivityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Activity</h1>
        <p className="text-zinc-500 mt-1">
          Real-time contract events and interactions
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
