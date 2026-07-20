'use client';

import { useEffect, useState } from 'react';
import { sendLocalNotification } from '@/lib/notifications/request-permission';

interface Reminder {
  id: string;
  habitName: string;
  time: string; // "08:00" format
  days: number[]; // 0=Sun, 1=Mon, etc.
  enabled: boolean;
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Mark as client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load reminders from localStorage on mount
  useEffect(() => {
    if (!isClient) return;
    const saved = localStorage.getItem('vitalis_reminders');
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse reminders', e);
      }
    }
  }, [isClient]);

  // Save to localStorage when changed
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('vitalis_reminders', JSON.stringify(reminders));
  }, [reminders, isClient]);

  // Check reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDay = now.getDay();

      reminders.forEach(reminder => {
        if (!reminder.enabled) return;
        if (reminder.time === currentTime && reminder.days.includes(currentDay)) {
          sendLocalNotification(
            'Vitalis Reminder',
            `Time for: ${reminder.habitName}`
          );
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminders]);

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: crypto.randomUUID(),
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  return { reminders, addReminder, removeReminder, toggleReminder };
}
