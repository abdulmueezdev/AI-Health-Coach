import { createClient } from "@/lib/supabase/server"
import { serverEnv } from "@/lib/env/server"
import CoachChat from "./coach-chat"
import Script from "next/script"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function CoachPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // redirect("/login")
  }

  return (
    <DashboardLayout>
      <Script src={`https://code.responsivevoice.org/responsivevoice.js?key=${serverEnv.RESPONSIVE_VOICE_KEY}`} strategy="lazyOnload" />
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h1 className="font-zodiak text-4xl font-bold mb-2">AI Coach</h1>
          <p className="text-text-secondary font-sans text-lg">
            Chat with Vitalis for personalized advice.
          </p>
        </div>
        
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          <CoachChat userId={user?.id || "temp-id"} />
        </div>
      </div>
    </DashboardLayout>
  )
}
