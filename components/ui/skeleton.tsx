import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-purple-950/40 border border-purple-500/10", className)}
      {...props}
    />
  )
}

/** Reusable Skeleton UI for Data Cards (metrics, info stats, summary cards) */
function SkeletonDataCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-purple-500/20 bg-zinc-950/40 backdrop-blur-md p-6 shadow-xl space-y-4 animate-pulse",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-3 w-20 font-mono" />
      </div>
      <div className="pt-2 flex items-center justify-between border-t border-purple-500/10">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

/** Reusable Skeleton UI for Holdings Lists (token lists, wallet holdings, asset tables) */
function SkeletonHoldingsList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3 w-full", className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-4 rounded-xl border border-purple-500/20 bg-zinc-950/40 backdrop-blur-md animate-pulse"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 font-mono text-xs" />
            </div>
          </div>
          <div className="text-right space-y-1.5">
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-3 w-14 font-mono text-xs ml-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Reusable Skeleton UI for Tier Ranks (VIP Tiers, Member Levels, Access Ranks) */
function SkeletonTierRank({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-purple-500/20 bg-zinc-950/40 backdrop-blur-md p-6 shadow-xl space-y-6 animate-pulse relative overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-24 font-mono text-xs" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-mono">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-28 font-mono uppercase tracking-wider" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

export { Skeleton, SkeletonDataCard, SkeletonHoldingsList, SkeletonTierRank }
