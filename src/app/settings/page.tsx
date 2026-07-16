"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, Save } from "lucide-react"
import { signOut } from "@/server/actions/auth"
import { EmptyState, LoadingSkeleton, ErrorState } from "@/components/ui/states"
import { useUser } from "@/lib/hooks/useUser"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useUser()
  const [loading, setLoading] = useState(false)
  const [error] = useState<string | null>(null)
  const [isEmpty] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate save
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-playfair text-4xl font-bold mb-2">Settings</h1>
          <p className="text-text-secondary font-sans text-lg">
            Manage your profile, goals, and preferences.
          </p>
        </div>
      </div>

      {authLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => router.refresh()} />
      ) : isEmpty ? (
        <EmptyState 
          title="No settings available" 
          description="We couldn't load your settings profile."
          actionText="Refresh"
          onAction={() => router.refresh()}
        />
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input id="displayName" defaultValue={profile?.display_name || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (in)</Label>
                      <Input id="height" type="number" defaultValue={profile?.height || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Starting Weight (lbs)</Label>
                      <Input id="weight" type="number" defaultValue={profile?.starting_weight || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetWeight">Target Weight (lbs)</Label>
                      <Input id="targetWeight" type="number" defaultValue={profile?.target_weight || ""} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-status-positive font-medium h-5">
                      {saved && "Settings saved successfully."}
                    </div>
                    <Button type="submit" disabled={loading} className="gap-2">
                      <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-card bg-canvas">
                  <div>
                    <p className="font-medium text-text-primary">Theme</p>
                    <p className="text-sm text-text-secondary">Choose your preferred appearance</p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between pt-6">
                  <div>
                    <h4 className="font-bold text-text-primary">Sign Out</h4>
                    <p className="text-sm text-text-secondary">Log out of your current session on this device.</p>
                  </div>
                  <Button type="button" variant="outline" className="bg-white border-gray-200 text-text-primary hover:bg-gray-50 gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </DashboardLayout>
  )
}
