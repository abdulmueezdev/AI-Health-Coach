"use client"

import { useEffect, useState } from "react"
import { motion, Variants } from "framer-motion"
import { useUser } from "@/lib/hooks/useUser"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Flame, Target, Trophy, ArrowUpRight } from "lucide-react"

// Simple CountUp component
function CountUp({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / (duration * 1000), 1)
      
      // Easing out function
      const easeOut = 1 - Math.pow(1 - percentage, 3)
      setCount(Math.floor(end * easeOut))

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount)
      }
    }

    animationFrame = requestAnimationFrame(updateCount)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <>{count}{suffix}</>
}

export default function DashboardPage() {
  const { profile } = useUser()
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  const insightPanel = (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-sm">Vitalis</span>
        </div>
        <h3 className="font-zodiak text-lg font-bold">You&apos;re crushing it</h3>
      </div>
      
      <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-accent-primary uppercase tracking-wider font-bold mb-3">Daily Tip</p>
          <p className="font-sans text-sm text-text-secondary leading-relaxed">Let&apos;s keep the momentum going! Remember to stay hydrated after your workout.</p>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        <h4 className="font-sans text-sm font-bold text-text-secondary uppercase tracking-wider mt-8 mb-4">Recommended Actions</h4>
        {[
          "Extend fast by 30m",
          "15m Outdoor walk",
          "Deep breathing session"
        ].map((action, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            className="flex items-center justify-between p-4 bg-white/50 hover:bg-white border border-white/60 rounded-xl cursor-pointer transition-all group"
          >
            <span className="font-medium text-sm">{action}</span>
            <ArrowUpRight className="w-4 h-4 text-text-secondary group-hover:text-accent-primary transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardLayout insightPanel={insightPanel}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="font-zodiak text-4xl font-bold mb-2">Good Morning, {profile?.display_name || "there"}</h1>
        <p className="text-text-secondary font-sans text-lg">
          You&apos;re on track! Your recovery score is <span className="text-status-positive font-bold">88%</span> today.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
      >
        {/* Stat Card 1: Calories */}
        <motion.div variants={item}>
          <Card className="h-full hover:border-panel-accent/50 transition-colors cursor-default">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-accent-primary flex items-center justify-center mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Calories</h3>
              <div className="font-comico text-3xl font-bold text-text-primary mb-2">
                <CountUp end={1840} /> <span className="text-base text-text-secondary font-sans font-normal">/ 2400</span>
              </div>
              <div className="text-xs font-medium px-3 py-1 bg-panel-accent/30 text-teal-800 rounded-full mt-auto">
                Goal: Weight Loss
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stat Card 2: Workouts */}
        <motion.div variants={item}>
          <Card className="h-full hover:border-panel-accent/50 transition-colors cursor-default">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Workouts</h3>
              <div className="font-comico text-3xl font-bold text-text-primary mb-2">
                <CountUp end={4} /> <span className="text-base text-text-secondary font-sans font-normal">/ 5 days</span>
              </div>
              <div className="w-full mt-auto pt-4 flex gap-1 h-8 items-end justify-center">
                {[1, 1, 1, 1, 0, 0, 0].map((active, i) => (
                  <div key={i} className={`w-full rounded-sm ${active ? 'bg-blue-400 h-full' : 'bg-gray-100 h-1/3'}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stat Card 3: Weight */}
        <motion.div variants={item}>
          <Card className="h-full hover:border-panel-accent/50 transition-colors cursor-default">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 text-status-positive flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Weight Progress</h3>
              <div className="font-comico text-3xl font-bold text-text-primary mb-2">
                -<CountUp end={4} /><span className="font-sans">.2</span> <span className="text-base text-text-secondary font-sans font-normal">lbs</span>
              </div>
              <div className="text-xs font-medium text-status-positive mt-auto flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 rotate-90" /> On Track
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Habits Section (Dashboard preview) */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="space-y-4"
      >
        <h2 className="font-zodiak text-2xl font-bold mb-6">Today&apos;s Habits</h2>
        {[
          { name: "Hydration", current: "2.1L", total: "3.0L", progress: 70, color: "bg-blue-500" },
          { name: "Sleep", current: "7.2h", total: "8.0h", progress: 90, color: "bg-indigo-500" },
          { name: "Steps", current: "8,432", total: "10k", progress: 84, color: "bg-green-500" }
        ].map((habit, i) => (
          <motion.div variants={item} key={i}>
            <Card className="group hover:border-panel-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-sm">{habit.name}</span>
                    <span className="text-xs text-text-secondary">{habit.current} / {habit.total}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${habit.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      viewport={{ once: true }}
                      className={`h-full rounded-full ${habit.color}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </DashboardLayout>
  )
}
