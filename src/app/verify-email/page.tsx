"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "your email address"
  
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle")
  const [cooldown, setCooldown] = useState(0)

  // Countdown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResend = async () => {
    if (resending || cooldown > 0) return
    
    setResending(true)
    setResendStatus("idle")
    
    try {
      // Assuming you have an API route or server action for this, 
      // otherwise this is a placeholder for the Supabase resend function
      // supabase.auth.resend({ type: 'signup', email })
      await new Promise(resolve => setTimeout(resolve, 1000)) // mock delay
      setResendStatus("success")
      setCooldown(60) // 60 seconds cooldown
    } catch {
      setResendStatus("error")
    } finally {
      setResending(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      
      <h2 className="font-playfair text-3xl font-bold mb-4">Check your email</h2>
      
      <p className="text-text-secondary text-lg font-sans mb-6">
        We sent a confirmation link to <span className="font-medium text-text-primary">{email}</span>. 
        Please click the link to verify your account and continue.
      </p>

      <div className="space-y-4">
        <Button asChild className="w-full" variant="outline">
          <Link href="/login">Return to login</Link>
        </Button>
        
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-text-secondary mb-2">Didn&apos;t receive the email?</p>
          <Button 
            variant="ghost" 
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-accent-primary hover:text-accent-primary hover:bg-accent-primary/10"
          >
            {resending ? "Sending..." : cooldown > 0 ? `Wait ${cooldown}s` : resendStatus === "success" ? "Email sent!" : "Click to resend"}
          </Button>
          
          {resendStatus === "error" && (
            <p className="text-sm text-status-warning mt-2">Failed to resend. Please try again.</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-text-primary selection:bg-accent-primary selection:text-white">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 text-center flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
