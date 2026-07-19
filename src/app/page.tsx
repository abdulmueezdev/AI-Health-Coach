"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-primary)] selection:text-white overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-[var(--bg-canvas)]/80 border-b border-[var(--border-color)]/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold font-fredoka">
            V
          </div>
          <span className="font-playfair text-xl font-bold">Vitalis</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-sans text-sm font-medium text-[var(--text-secondary)]">
          <Link href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="font-sans text-sm font-medium hover:text-[var(--accent-primary)] transition-colors">
            Log in
          </Link>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center md:text-left"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--bg-panel-accent)]/10 text-[var(--text-primary)] font-medium text-sm mb-6 border border-[var(--border-color)]">
              Meet your new personal AI fitness coach
            </div>
            <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Wellness is a connection of <span className="text-[var(--accent-primary)]">mind, body, and spirit.</span>
            </h1>
            <p className="font-sans text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto md:mx-0">
              Track your meals with photos, plan personalized workouts, and build lasting habits with an AI coach that truly understands your journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Button asChild className="w-full sm:w-auto h-14 px-10 text-lg">
                <Link href="/signup">Start Your Journey</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto h-14 px-10 text-lg bg-[var(--card-bg)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-panel-accent)]/20">
                <Link href="#features">Watch Demo</Link>
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center md:justify-start gap-8">
              <div className="flex flex-col">
                <span className="font-fredoka text-3xl font-bold text-[var(--text-primary)]">10k+</span>
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Active Users</span>
              </div>
              <div className="w-px h-12 bg-[var(--border-color)]"></div>
              <div className="flex flex-col">
                <span className="font-fredoka text-3xl font-bold text-status-positive">4.9/5</span>
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Average Rating</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="aspect-[4/5] bg-[var(--bg-sidebar)] rounded-[32px] shadow-2xl overflow-hidden border border-[var(--border-color)] relative z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-panel-accent)]/10 to-[var(--bg-canvas)]/50"></div>
              {/* Dashboard Preview Mockup */}
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20"></div>
                  <div className="w-24 h-4 rounded-full bg-[var(--border-color)]"></div>
                </div>
                <div className="w-3/4 h-8 rounded-lg bg-[var(--border-color)] mb-4"></div>
                <div className="w-1/2 h-4 rounded-lg bg-[var(--border-color)]/50 mb-8"></div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm h-32"></div>
                  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm h-32"></div>
                </div>
                
                <div className="bg-[var(--bg-panel-accent)]/20 rounded-2xl p-6 flex-1 border border-[var(--border-color)]">
                  <div className="w-1/3 h-4 rounded-full bg-[var(--bg-panel-accent)] mb-4"></div>
                  <div className="w-full h-3 rounded-full bg-white/50 dark:bg-white/10 mb-2"></div>
                  <div className="w-5/6 h-3 rounded-full bg-white/50 dark:bg-white/10 mb-2"></div>
                  <div className="w-4/6 h-3 rounded-full bg-white/50 dark:bg-white/10"></div>
                </div>
              </div>
            </div>
            
            {/* Decorative background blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[var(--accent-primary)]/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[var(--bg-panel-accent)]/20 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
