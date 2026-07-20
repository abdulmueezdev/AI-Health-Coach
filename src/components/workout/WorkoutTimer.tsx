"use client";
import { useState, useEffect } from "react";

interface WorkoutTimerProps {
  workoutName: string;
  estimatedDuration: number; // in minutes
  onComplete: (actualDuration: number) => void;
  onCancel: () => void;
}

export function WorkoutTimer({ workoutName, estimatedDuration, onComplete, onCancel }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--card-bg)] rounded-3xl p-8 max-w-md w-full text-center border border-[var(--border-color)]">
        <h3 className="font-fredoka text-2xl text-[var(--text-primary)] mb-2">{workoutName}</h3>
        <p className="text-[var(--text-secondary)] mb-8">Estimated: {estimatedDuration} min</p>
        
        <div className="text-6xl font-fredoka text-[var(--accent-primary)] mb-8 font-mono">
          {formatTime(elapsed)}
        </div>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-3 rounded-full bg-[var(--bg-panel-accent)] text-[var(--text-primary)] font-medium"
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          
          <button
            onClick={() => onComplete(elapsed)}
            className="px-6 py-3 rounded-full bg-[var(--accent-primary)] text-white font-medium"
          >
            Complete
          </button>
          
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
