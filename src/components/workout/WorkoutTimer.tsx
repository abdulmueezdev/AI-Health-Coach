"use client";
import { useState, useEffect } from "react";

interface WorkoutTimerProps {
  workoutName: string;
  estimatedDuration: number; // in minutes
  onComplete: (actualDurationSeconds: number) => void;
  onCancel: () => void;
}

const playChime = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1); // C6
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch {
    console.log('Audio not available');
  }
};

export function WorkoutTimer({ workoutName, estimatedDuration, onComplete, onCancel }: WorkoutTimerProps) {
  const [mode, setMode] = useState<'up' | 'down'>('down');
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  
  const totalSeconds = estimatedDuration * 60;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const displayTime = mode === 'down' ? remaining : elapsed;
  
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (mode === 'down' && next === totalSeconds) {
          playChime();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode, totalSeconds]);
  
  const handleComplete = () => {
    playChime();
    onComplete(elapsed);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const radius = 120;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = mode === 'down' 
    ? elapsed / totalSeconds 
    : (elapsed % 3600) / 3600;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--card-bg)] rounded-3xl p-8 max-w-md w-full text-center border border-[var(--border-color)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <h3 className="font-fredoka text-2xl text-[var(--text-primary)] mb-2">{workoutName}</h3>
        <p className="text-[var(--text-secondary)] mb-6 text-sm">Estimated: {estimatedDuration} min</p>

        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
            <circle
              stroke="var(--border-color)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="var(--accent-primary)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference - Math.min(progress, 1) * circumference}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-fredoka text-[var(--text-primary)] font-mono tabular-nums">
              {formatTime(displayTime)}
            </span>
          </div>
          {!isRunning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-[104px] backdrop-blur-[1px]">
              <span className="text-lg font-fredoka text-[var(--text-primary)] tracking-widest">PAUSED</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center mb-6">
          <button
            onClick={() => setMode('down')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              mode === 'down' 
                ? 'bg-[var(--accent-primary)] text-white' 
                : 'bg-[var(--border-color)] text-[var(--text-secondary)]'
            }`}
          >
            Count Down
          </button>
          <button
            onClick={() => setMode('up')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              mode === 'up' 
                ? 'bg-[var(--accent-primary)] text-white' 
                : 'bg-[var(--border-color)] text-[var(--text-secondary)]'
            }`}
          >
            Count Up
          </button>
        </div>

        {mode === 'down' ? (
          <div className="mb-6 h-10 flex items-center justify-center">
            <button
              onClick={() => setElapsed(e => Math.max(0, e - 300))}
              className="px-4 py-2 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] text-sm hover:border-[var(--accent-primary)] transition-colors"
            >
              +5 min
            </button>
          </div>
        ) : (
          <div className="mb-6 h-10" />
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              isRunning 
                ? 'bg-[var(--bg-panel-accent)] text-[var(--text-primary)]' 
                : 'bg-[var(--accent-primary)] text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>

          <button
            onClick={handleComplete}
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
