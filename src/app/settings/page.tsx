'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useUser } from '@/lib/hooks/useUser';
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
    <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-[var(--accent-primary)]" />
        </div>
        <div>
          <h3 className="text-lg font-fredoka text-[var(--text-primary)]">Habit Reminders</h3>
          <p className="text-sm text-[var(--text-secondary)]">Get notified when it&apos;s time</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          placeholder="Habit name (e.g., Deep breathing)"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          className="flex h-12 w-full rounded-full border border-[var(--border-color)] bg-[var(--bg-canvas)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
        />
        
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-canvas)] px-4 text-sm text-[var(--text-primary)]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {days.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDays(prev => 
                prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
              )}
              className={`w-10 h-10 rounded-full text-xs font-medium transition-colors ${
                selectedDays.includes(i)
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--border-color)]/30 text-[var(--text-secondary)]'
              }`}
            >
              {day[0]}
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 h-12 rounded-full bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)] text-center py-4">No reminders yet. Add one above!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reminders.map(reminder => (
            <div
              key={reminder.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                reminder.enabled 
                  ? 'border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5' 
                  : 'border-[var(--border-color)] bg-[var(--bg-canvas)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleReminder(reminder.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    reminder.enabled 
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' 
                      : 'border-[var(--border-color)]'
                  }`}
                >
                  {reminder.enabled && <Check className="w-3 h-3 text-white" />}
                </button>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{reminder.habitName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {reminder.time} · {reminder.days.map(d => days[d]).join(', ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeReminder(reminder.id)}
                className="p-2 rounded-full hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
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

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useUser();
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

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--border-color)] rounded w-1/3"></div>
          <div className="h-64 bg-[var(--border-color)] rounded-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-[var(--border-color)] rounded-3xl"></div>
            <div className="h-48 bg-[var(--border-color)] rounded-3xl"></div>
            <div className="h-48 bg-[var(--border-color)] rounded-3xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Please sign in to view settings.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-medium text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage your profile, goals, and preferences.
          </p>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
        <motion.div variants={item}>
          {/* PROFILE CARD */}
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)]">
            <h2 className="text-lg font-fredoka text-[var(--text-primary)] mb-4">
              Profile
            </h2>
            {profile ? (
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

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                  <div className="text-sm text-[var(--status-positive)] font-medium h-5">
                    {saved && "Settings saved successfully."}
                  </div>
                  <Button type="submit" disabled={loading} className="gap-2">
                    <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">Loading profile...</p>
            )}
          </div>
        </motion.div>

        <motion.div variants={item}>
          {/* APPEARANCE CARD */}
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)]">
            <h2 className="text-lg font-fredoka text-[var(--text-primary)] mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between rounded-card bg-[var(--bg-sidebar)] p-4">
              <div>
                <p className="font-medium text-[var(--text-primary)]">Theme</p>
                <p className="text-sm text-[var(--text-secondary)]">Choose your preferred appearance</p>
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
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">Sign Out</h4>
                <p className="text-sm text-[var(--text-secondary)]">Log out of your current session on this device.</p>
              </div>
              <Button type="button" variant="outline" className="bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-panel-accent)]/20 gap-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          {/* BOTTOM ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)]">
              <h3 className="text-base font-fredoka text-[var(--text-primary)]">Goals</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Your fitness goals.</p>
            </div>
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)]">
              <h3 className="text-base font-fredoka text-[var(--text-primary)]">Activity</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Your activity level.</p>
            </div>
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)]">
              <h3 className="text-base font-fredoka text-[var(--text-primary)]">Account</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Account settings.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
