'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/server/actions/onboarding'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [goalType, setGoalType] = useState('maintain')
  const [startingWeight, setStartingWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [height, setHeight] = useState('')
  const [activityLevel, setActivityLevel] = useState('moderate')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const result = await completeOnboarding({
      goalType,
      startingWeight: Number(startingWeight),
      targetWeight: Number(targetWeight),
      height: Number(height),
      activityLevel,
      displayName
    })

    if (!result.success) {
      setError(result.error || 'Failed to save profile')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-brand-primary flex items-center justify-center p-4">
      <div className="bg-card-bg rounded-[24px] shadow-sm p-8 max-w-md w-full">
        <h1 className="font-comico text-3xl mb-6 text-center">Welcome to Vitalis</h1>
        
        {error && <div className="bg-status-warning/20 text-status-warning p-3 rounded-md mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-zodiak text-xl mb-4">Step 1: Your Goal</h2>
              <div className="space-y-2">
                {['lose weight', 'maintain', 'gain weight'].map(goal => (
                  <label key={goal} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-canvas/50">
                    <input 
                      type="radio" 
                      name="goal" 
                      value={goal}
                      checked={goalType === goal}
                      onChange={(e) => setGoalType(e.target.value)}
                      className="text-accent-primary"
                    />
                    <span className="capitalize font-sans">{goal}</span>
                  </label>
                ))}
              </div>
              <button type="button" onClick={handleNext} className="w-full bg-accent-primary text-white py-3 rounded-full font-sans font-medium mt-6">Next</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-zodiak text-xl mb-4">Step 2: Baseline Stats</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1 font-sans">Starting Weight (lbs/kg)</label>
                <input type="number" required value={startingWeight} onChange={e => setStartingWeight(e.target.value)} className="w-full p-3 border rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 font-sans">Target Weight (lbs/kg)</label>
                <input type="number" required value={targetWeight} onChange={e => setTargetWeight(e.target.value)} className="w-full p-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 font-sans">Height (cm/in)</label>
                <input type="number" required value={height} onChange={e => setHeight(e.target.value)} className="w-full p-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 font-sans">Activity Level</label>
                <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className="w-full p-3 border rounded-lg">
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="very">Very Active</option>
                </select>
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={handleBack} className="w-1/3 border border-gray-300 py-3 rounded-full font-sans">Back</button>
                <button type="button" onClick={handleNext} className="w-2/3 bg-accent-primary text-white py-3 rounded-full font-sans font-medium">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-zodiak text-xl mb-4">Step 3: Display Name</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1 font-sans">What should we call you?</label>
                <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Your name" />
              </div>

              <div className="flex space-x-3 mt-6">
                <button type="button" onClick={handleBack} className="w-1/3 border border-gray-300 py-3 rounded-full font-sans">Back</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-accent-primary text-white py-3 rounded-full font-sans font-medium disabled:opacity-50">
                  {loading ? 'Saving...' : 'Complete'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
