"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/server/actions/auth"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    const result = await signIn(email, password)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-text-primary selection:bg-accent-primary selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold font-fredoka mb-4">
            V
          </div>
          <h1 className="font-playfair text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-text-secondary font-sans">Enter your details to sign in</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="alex@example.com" 
              required 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-sm text-accent-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-status-warning/10 text-status-warning text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent-primary font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
