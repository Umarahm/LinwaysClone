import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "shimmer" | "glass"
}) {
  const variants = {
    default: "animate-pulse rounded-md bg-muted",
    shimmer: "skeleton-shimmer rounded-md",
    glass: "skeleton-glass rounded-md"
  }

  return (
    <div
      className={cn(variants[variant], className)}
      {...props}
    />
  )
}

// Dashboard Card Skeleton
function DashboardCardSkeleton() {
  return (
    <div className="space-y-4 p-6 rounded-xl border bg-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-[120px]" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    </div>
  )
}

// Stats Card Skeleton
function StatsCardSkeleton() {
  return (
    <div className="space-y-3 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-8 w-[60px]" />
      <Skeleton className="h-3 w-[100px]" />
    </div>
  )
}

// Timetable Skeleton
function TimetableSkeleton() {
  return (
    <div className="space-y-4 p-6 rounded-xl border bg-card">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-6 w-[140px]" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
            <Skeleton className="h-3 w-[60px]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
            <Skeleton className="h-6 w-[60px] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Course Grid Skeleton
function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3 p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-[60px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Dashboard Hero Skeleton
function DashboardHeroSkeleton() {
  return (
    <div className="space-y-6 p-8 rounded-3xl bg-card/50 backdrop-blur border">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-[300px]" />
              <Skeleton className="h-5 w-[200px]" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 p-4 rounded-lg bg-card/30">
              <Skeleton className="h-6 w-[40px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Table Skeleton
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-4 p-4 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-[80px]" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-4">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-[100px]" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Assignment Card Skeleton
function AssignmentCardSkeleton() {
  return (
    <div className="space-y-4 p-6 rounded-lg border bg-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-6 w-[80px] rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-8 w-[80px] rounded" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  DashboardCardSkeleton,
  StatsCardSkeleton,
  TimetableSkeleton,
  CourseGridSkeleton,
  DashboardHeroSkeleton,
  TableSkeleton,
  AssignmentCardSkeleton
}
