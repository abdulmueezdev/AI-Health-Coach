import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoadingSkeleton } from "@/components/ui/states"

export default function SettingsLoading() {
  return (
    <DashboardLayout>
      <div className="mb-10 animate-pulse">
        <div className="h-10 w-48 bg-[var(--bg-panel-accent)]/20 rounded-md mb-2"></div>
        <div className="h-6 w-72 bg-[var(--bg-panel-accent)]/20 rounded-md"></div>
      </div>
      <LoadingSkeleton />
    </DashboardLayout>
  )
}
