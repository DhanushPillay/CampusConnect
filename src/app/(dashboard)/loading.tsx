import { CardsSkeleton, Skeleton } from "@/shared/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <CardsSkeleton />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
