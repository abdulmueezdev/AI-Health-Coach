/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Bell, Plus, Trash2, Clock, Check, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useReminders } from '@/lib/hooks/useReminders';
import { requestNotificationPermission } from '@/lib/notifications/request-permission';
import { motion } from "framer-motion";
import { signOut } from "@/server/actions/auth";
import { useRouter } from "next/navigation";

const RemindersSection = () => {
  const { reminders, addReminder, removeReminder, toggleReminder } = useReminders();
  const [newHabit, setNewHabit] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1,2,3,4,5]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleAdd = async () => {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      alert('Please enable notifications in your browser settings.');
      return;
    }
    if (!newHabit.trim()) return;
    addReminder({
      habitName: newHabit,
      time: newTime,
      days: selectedDays,
      enabled: true,
    });
    setNewHabit('');
  };

  return (
    <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-6 border border-gray-200 dark:border-[#3a3a3a]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when it's time</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          placeholder="Habit name (e.g., Deep breathing)"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          className="flex h-12 w-full rounded-full border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400"
        />
        
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="h-10 rounded-full border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-4 text-sm text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {days.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDays(prev => 
                prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
              )}
              className={`w-10 h-10 rounded-full text-xs font-medium transition-colors ${
                selectedDays.includes(i)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-[#3a3a3a] text-gray-600 dark:text-gray-400'
              }`}
            >
              {day[0]}
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          type="button"
          className="flex items-center justify-center gap-2 h-12 rounded-full bg-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">No reminders yet. Add one above!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reminders.map(reminder => (
            <div
              key={reminder.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                reminder.enabled 
                  ? 'border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10' 
                  : 'border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleReminder(reminder.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    reminder.enabled 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300 dark:border-[#4a4a4a]'
                  }`}
                >
                  {reminder.enabled && <Check className="w-3 h-3 text-white" />}
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{reminder.habitName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {reminder.time} · {reminder.days.map(d => days[d]).join(', ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeReminder(reminder.id)}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function SettingsClient({ initialProfile, user }: { initialProfile: any, user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-medium text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your profile, goals, and preferences.
          </p>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
        <motion.div variants={item}>
          {/* PROFILE CARD */}
          <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-6 border border-gray-200 dark:border-[#3a3a3a]">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Profile
            </h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-gray-900 dark:text-white">Display Name</Label>
                  <Input id="displayName" defaultValue={initialProfile?.display_name || ""} className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white border-gray-200 dark:border-[#3a3a3a]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-white">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ""} disabled className="bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-200 dark:border-[#3a3a3a]" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-gray-900 dark:text-white">Height (in)</Label>
                  <Input id="height" type="number" defaultValue={initialProfile?.height || ""} className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white border-gray-200 dark:border-[#3a3a3a]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-gray-900 dark:text-white">Starting Weight (lbs)</Label>
                  <Input id="weight" type="number" defaultValue={initialProfile?.starting_weight || ""} className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white border-gray-200 dark:border-[#3a3a3a]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight" className="text-gray-900 dark:text-white">Target Weight (lbs)</Label>
                  <Input id="targetWeight" type="number" defaultValue={initialProfile?.target_weight || ""} className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white border-gray-200 dark:border-[#3a3a3a]" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#3a3a3a]">
                <div className="text-sm text-green-600 dark:text-green-400 font-medium h-5">
                  {saved && "Settings saved successfully."}
                </div>
                <Button type="submit" disabled={loading} className="gap-2">
                  <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div variants={item}>
          {/* APPEARANCE CARD */}
          <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-6 border border-gray-200 dark:border-[#3a3a3a]">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-[#1e1e1e] p-4 border border-gray-200 dark:border-[#3a3a3a]">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred appearance</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          {/* REMINDERS CARD */}
          <RemindersSection />
        </motion.div>

        <motion.div variants={item}>
          {/* SIGN OUT CARD */}
          <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-6 border border-gray-200 dark:border-[#3a3a3a]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Sign Out</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Log out of your current session on this device.</p>
              </div>
              <Button type="button" variant="outline" className="bg-[#EF5B4B] text-white hover:bg-[#D94C3E] border-none gap-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          {/* BOTTOM ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-6 border border-gray-200 dark:border-[#3a3a3a]">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Goals</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Your fitness goals.</p>
            </div>
            <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-6 border border-gray-200 dark:border-[#3a3a3a]">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Activity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Your activity level.</p>
            </div>
            <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-6 border border-gray-200 dark:border-[#3a3a3a]">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Account</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Account settings.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
