"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/server/actions/auth"

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    
    const result = await signUp(email, password, name)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      if (result.hasSession) {
        router.push("/onboarding")
      } else {
        setSuccess(true)
        setLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-text-primary selection:bg-accent-primary selection:text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[var(--card-bg)] rounded-[24px] p-8 shadow-sm border border-[var(--border-color)] text-center"
        >
          <div className="w-16 h-16 rounded-full bg-status-positive/20 text-status-positive flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-playfair text-3xl font-bold mb-4">Check your email</h2>
          <p className="text-text-secondary text-lg font-sans">We&apos;ve sent a confirmation email to your address. Please verify your account to continue.</p>
          <Button asChild className="w-full">
            <Link href="/login">Return to login</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-text-primary selection:bg-accent-primary selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--card-bg)] rounded-[24px] p-8 shadow-sm border border-[var(--border-color)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold font-fredoka mb-4">
            V
          </div>
          <h1 className="font-playfair text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-text-secondary font-sans">Start your wellness journey today</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              name="name" 
              type="text" 
              placeholder="John" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="john@example.com" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-status-warning/10 text-status-warning text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
